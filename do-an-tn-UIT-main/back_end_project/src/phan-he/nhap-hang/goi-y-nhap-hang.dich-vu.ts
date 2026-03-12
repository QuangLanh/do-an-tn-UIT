import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from '../don-hang/schemas/order.schema';
import { Product, ProductDocument } from '../san-pham/schemas/product.schema';
import { DichVuNhapHang } from './nhap-hang.dich-vu';
import { TrangThaiDonHang } from '../../dung-chung/liet-ke/trang-thai-don-hang.enum';
import {
  GoiYNhapHangDto,
  MucGoiYNhapHangDto,
} from './dto/goi-y-nhap-hang.dto';

// ─── Bảng hệ số mùa vụ (1 = tháng 1, 12 = tháng 12) ────────────────────────
//
//  Ngữ cảnh: Cửa hàng tạp hóa tại Việt Nam
//
//  Tháng 1  – Bình thường (vừa qua Tết Dương Lịch)
//  Tháng 2  – Cao: Tết Nguyên Đán, mua sắm tăng mạnh
//  Tháng 3  – Bình thường
//  Tháng 4  – Nhẹ tăng: đầu mùa nóng
//  Tháng 5  – Cao: mùa nóng bắt đầu, nước giải khát tăng
//  Tháng 6  – Cao nhất: nắng đỉnh điểm
//  Tháng 7  – Cao nhất: nắng đỉnh điểm
//  Tháng 8  – Cao: cuối mùa nóng
//  Tháng 9  – Bình thường: tựu trường
//  Tháng 10 – Nhẹ giảm: mùa mưa, mát hơn
//  Tháng 11 – Nhẹ giảm
//  Tháng 12 – Tăng: lễ Noel, năm mới, tặng quà
// ─────────────────────────────────────────────────────────────────────────────
interface SeasonInfo {
  factor: number;   // hệ số nhân (1.0 = bình thường)
  label: string;    // mô tả ngắn gọn để hiển thị trên UI
}

const SEASONAL_TABLE: Record<number, SeasonInfo> = {
  1:  { factor: 1.0, label: 'Tháng 1 – Bình thường'              },
  2:  { factor: 1.3, label: 'Tháng 2 – Tết Nguyên Đán (+30%)'   },
  3:  { factor: 1.0, label: 'Tháng 3 – Bình thường'              },
  4:  { factor: 1.1, label: 'Tháng 4 – Đầu mùa nóng (+10%)'     },
  5:  { factor: 1.3, label: 'Tháng 5 – Mùa nóng (+30%)'         },
  6:  { factor: 1.4, label: 'Tháng 6 – Đỉnh mùa nóng (+40%)'   },
  7:  { factor: 1.4, label: 'Tháng 7 – Đỉnh mùa nóng (+40%)'   },
  8:  { factor: 1.3, label: 'Tháng 8 – Cuối mùa nóng (+30%)'   },
  9:  { factor: 1.0, label: 'Tháng 9 – Tựu trường (bình thường)'},
  10: { factor: 0.9, label: 'Tháng 10 – Mùa mưa (-10%)'         },
  11: { factor: 0.9, label: 'Tháng 11 – Mùa mưa (-10%)'         },
  12: { factor: 1.2, label: 'Tháng 12 – Lễ cuối năm (+20%)'     },
};

@Injectable()
export class DichVuGoiYNhapHang {
  private readonly logger = new Logger(DichVuGoiYNhapHang.name);

  // ─── Cấu hình cố định ───────────────────────────────────────────────────
  private readonly ANALYSIS_DAYS = 30;            // Cửa sổ phân tích bán hàng
  private readonly LEAD_TIME_DAYS = 7;            // Lead time nhập hàng (ngày)
  private readonly SAFETY_STOCK_MULTIPLIER = 1.5; // Hệ số an toàn tồn kho
  // ─────────────────────────────────────────────────────────────────────────

  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private dichVuNhapHang: DichVuNhapHang,
  ) {}

  // ─────────────────────────────────────────────────────────────────────────
  //  Trả về SeasonInfo cho một tháng (1–12)
  // ─────────────────────────────────────────────────────────────────────────
  getSeasonInfo(month: number): SeasonInfo {
    return SEASONAL_TABLE[month] ?? { factor: 1.0, label: `Tháng ${month} – Bình thường` };
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  Tính toán gợi ý nhập hàng có xét yếu tố mùa vụ
  // ─────────────────────────────────────────────────────────────────────────
  async getRecommendations(): Promise<GoiYNhapHangDto> {
    this.logger.log('Generating seasonal purchase recommendations...');

    // Xác định tháng hiện tại (1–12)
    const currentMonth = new Date().getMonth() + 1;
    const seasonInfo = this.getSeasonInfo(currentMonth);

    this.logger.log(
      `Current month: ${currentMonth} | Seasonal factor: ${seasonInfo.factor} | ${seasonInfo.label}`,
    );

    // Lấy tất cả sản phẩm đang hoạt động
    const products = await this.productModel.find({ isActive: true }).exec();

    // Lấy trạng thái hạn sử dụng: chỉ dùng tồn kho chưa hết hạn
    const expiryMap = await this.dichVuNhapHang.getProductExpiryStatusMap(7);

    // Lấy dữ liệu bán hàng 30 ngày gần nhất
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - this.ANALYSIS_DAYS);

    const salesData = await this.orderModel
      .aggregate([
        {
          $match: {
            status: TrangThaiDonHang.COMPLETED,
            createdAt: { $gte: thirtyDaysAgo },
          },
        },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.product',
            totalQuantitySold: { $sum: '$items.quantity' },
            orderCount: { $sum: 1 },
          },
        },
      ])
      .exec();

    // Map tra cứu nhanh: productId → sales stats
    const salesMap = new Map<string, { totalQuantitySold: number; orderCount: number }>();
    salesData.forEach((item) => {
      salesMap.set(item._id.toString(), {
        totalQuantitySold: item.totalQuantitySold || 0,
        orderCount: item.orderCount || 0,
      });
    });

    // ─── Tính recommendation cho từng sản phẩm ────────────────────────────
    const recommendations: MucGoiYNhapHangDto[] = [];

    for (const product of products) {
      const productId = product._id.toString();
      const sales = salesMap.get(productId) ?? { totalQuantitySold: 0, orderCount: 0 };

      // Tồn kho hiệu dụng = tồn kho - hàng hết hạn (dùng expiryMap từ batch, fallback an toàn)
      const expiredQty = expiryMap[productId]?.expiredQty ?? 0;
      const effectiveStock = Math.max(0, (product.stock || 0) - expiredQty);

      // 1. Trung bình bán hàng mỗi ngày (30 ngày)
      const averageDailySales = sales.totalQuantitySold / this.ANALYSIS_DAYS;

      // 2. Áp dụng hệ số mùa vụ
      //    seasonalDemand = averageDailySales × seasonalFactor
      const seasonalDemand = averageDailySales * seasonInfo.factor;

      // 3. Reorder Point = (seasonalDemand × leadTime) + safetyStock
      //    safetyStock = seasonalDemand × leadTime × safetyMultiplier
      const safetyStock = seasonalDemand > 0
        ? Math.ceil(seasonalDemand * this.LEAD_TIME_DAYS * this.SAFETY_STOCK_MULTIPLIER)
        : (product.minStockLevel || 10);

      const reorderPoint = Math.ceil(
        seasonalDemand * this.LEAD_TIME_DAYS + safetyStock,
      );

      // 4. Số lượng nên nhập (dùng effectiveStock thay vì product.stock)
      const productForCalc = { stock: effectiveStock, minStockLevel: product.minStockLevel || 10 } as ProductDocument;
      const recommendedQuantity = this.calculateRecommendedQuantity(
        productForCalc,
        seasonalDemand,
        reorderPoint,
      );

      // 5. Priority + reason (dùng effectiveStock)
      const { priority, reason } = this.determinePriority(
        productForCalc,
        averageDailySales,
        sales.totalQuantitySold,
        seasonInfo.factor,
        reorderPoint,
      );

      if (recommendedQuantity > 0 || priority === 'high') {
        recommendations.push({
          productId,
          productName: product.name,
          currentStock: effectiveStock,
          minStockLevel: product.minStockLevel || 10,
          averageDailySales: Math.round(averageDailySales * 10) / 10,
          totalSoldLast30Days: sales.totalQuantitySold,
          seasonalFactor: seasonInfo.factor,
          seasonalDemand: Math.round(seasonalDemand * 10) / 10,
          reorderPoint,
          seasonLabel: seasonInfo.label,
          recommendedQuantity: Math.max(0, Math.ceil(recommendedQuantity)),
          priority,
          reason,
          suggestedPurchasePrice: product.purchasePrice,
        });
      }
    }

    // Phân loại & sắp xếp
    const highPriority = recommendations
      .filter((r) => r.priority === 'high')
      .sort((a, b) => b.recommendedQuantity - a.recommendedQuantity);

    const mediumPriority = recommendations
      .filter((r) => r.priority === 'medium')
      .sort((a, b) => b.recommendedQuantity - a.recommendedQuantity);

    const lowPriority = recommendations
      .filter((r) => r.priority === 'low')
      .sort((a, b) => b.recommendedQuantity - a.recommendedQuantity);

    this.logger.log(
      `Recommendations: ${highPriority.length} high, ${mediumPriority.length} medium, ${lowPriority.length} low`,
    );

    return {
      highPriority,
      mediumPriority,
      lowPriority,
      generatedAt: new Date().toISOString(),
      currentMonth,
      currentSeasonLabel: seasonInfo.label,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  Tính số lượng nên nhập
  //
  //  Logic:
  //   - Nếu currentStock < reorderPoint  →  cần nhập
  //   - Mục tiêu tồn kho = max(minStockLevel×2, seasonalDemand×leadTime×3)
  //   - Số lượng nhập = targetStock − currentStock
  // ─────────────────────────────────────────────────────────────────────────
  private calculateRecommendedQuantity(
    product: ProductDocument,
    seasonalDemand: number,
    reorderPoint: number,
  ): number {
    const currentStock = product.stock || 0;
    const minStockLevel = product.minStockLevel || 10;

    // Đủ hàng, không cần nhập
    if (currentStock >= minStockLevel * 2 && seasonalDemand === 0) {
      return 0;
    }

    // Chưa đến điểm tái đặt hàng
    if (currentStock > reorderPoint) {
      return 0;
    }

    // Mục tiêu tồn kho = đủ bán trong (leadTime × 3) ngày theo nhu cầu mùa vụ
    const targetStock = Math.max(
      minStockLevel * 2,
      Math.ceil(seasonalDemand * this.LEAD_TIME_DAYS * 3),
    );

    return Math.max(0, Math.ceil(targetStock - currentStock));
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  Xác định mức độ ưu tiên, có tính đến hệ số mùa vụ
  // ─────────────────────────────────────────────────────────────────────────
  private determinePriority(
    product: ProductDocument,
    averageDailySales: number,
    totalSoldLast30Days: number,
    seasonalFactor: number,
    reorderPoint: number,
  ): { priority: 'high' | 'medium' | 'low'; reason: string } {
    const currentStock = product.stock || 0;
    const minStockLevel = product.minStockLevel || 10;
    const stockRatio = currentStock / Math.max(minStockLevel, 1);
    const belowROP = currentStock < reorderPoint;
    const highSeason = seasonalFactor >= 1.3;
    const lowSeason = seasonalFactor < 1.0;

    // ── HIGH ──────────────────────────────────────────────────────────────
    if (belowROP && totalSoldLast30Days >= 20) {
      const seasonNote = highSeason ? ` (mùa cao điểm ×${seasonalFactor})` : '';
      return {
        priority: 'high',
        reason: `Bán chạy, dưới ROP${seasonNote} – nhập gấp`,
      };
    }

    if (stockRatio <= 0.5 && averageDailySales > 0) {
      return {
        priority: 'high',
        reason: 'Tồn kho rất thấp – nhập gấp',
      };
    }

    if (highSeason && belowROP && averageDailySales > 0) {
      return {
        priority: 'high',
        reason: `Mùa cao điểm (×${seasonalFactor}), tồn kho không đáp ứng ROP`,
      };
    }

    if (totalSoldLast30Days >= 50 && stockRatio <= 2) {
      return {
        priority: 'high',
        reason: 'Sản phẩm bán rất chạy – tăng tồn kho',
      };
    }

    // ── MEDIUM ────────────────────────────────────────────────────────────
    if (belowROP) {
      return {
        priority: 'medium',
        reason: `Tồn kho dưới Reorder Point (${reorderPoint})`,
      };
    }

    if (stockRatio <= 1.5 && totalSoldLast30Days >= 10) {
      return {
        priority: 'medium',
        reason: 'Tồn kho gần hết, có nhu cầu bán hàng',
      };
    }

    if (highSeason && stockRatio <= 3) {
      return {
        priority: 'medium',
        reason: `Mùa cao điểm (×${seasonalFactor}) – nên tích trữ sớm`,
      };
    }

    if (stockRatio <= 2 && averageDailySales > 0) {
      return {
        priority: 'medium',
        reason: 'Tồn kho đang giảm – nên nhập sớm',
      };
    }

    // ── LOW ───────────────────────────────────────────────────────────────
    if (lowSeason && totalSoldLast30Days > 0) {
      return {
        priority: 'low',
        reason: `Mùa thấp điểm (×${seasonalFactor}) – nhập ít để tránh tồn`,
      };
    }

    if (totalSoldLast30Days > 0 && totalSoldLast30Days < 10) {
      return {
        priority: 'low',
        reason: 'Bán chậm – nhập ít để tránh tồn kho',
      };
    }

    return {
      priority: 'medium',
      reason: 'Duy trì tồn kho theo nhu cầu mùa vụ',
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  Các convenience methods
  // ─────────────────────────────────────────────────────────────────────────
  async getHighPriorityRecommendations(): Promise<MucGoiYNhapHangDto[]> {
    return (await this.getRecommendations()).highPriority;
  }

  async getLowPriorityRecommendations(): Promise<MucGoiYNhapHangDto[]> {
    return (await this.getRecommendations()).lowPriority;
  }
}
