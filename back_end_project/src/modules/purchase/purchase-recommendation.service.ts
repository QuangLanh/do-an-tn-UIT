import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from '../order/schemas/order.schema';
import { Product, ProductDocument } from '../product/schemas/product.schema';
import { OrderStatus } from '../../common/enums/order-status.enum';
import {
  PurchaseRecommendationDto,
  PurchaseRecommendationItemDto,
} from './dto/purchase-recommendation.dto';

@Injectable()
export class PurchaseRecommendationService {
  private readonly logger = new Logger(PurchaseRecommendationService.name);

  // Cấu hình
  private readonly ANALYSIS_DAYS = 30; // Phân tích 30 ngày gần nhất
  private readonly LEAD_TIME_DAYS = 7; // Thời gian nhập hàng mất 7 ngày
  private readonly SAFETY_STOCK_MULTIPLIER = 1.5; // Hệ số an toàn

  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  /**
   * Tính toán gợi ý nhập hàng cho tất cả sản phẩm
   */
  async getRecommendations(): Promise<PurchaseRecommendationDto> {
    this.logger.log('Generating purchase recommendations...');

    // Lấy tất cả sản phẩm đang hoạt động
    const products = await this.productModel
      .find({ isActive: true })
      .exec();

    // Lấy dữ liệu bán hàng 30 ngày gần nhất
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - this.ANALYSIS_DAYS);

    const salesData = await this.orderModel
      .aggregate([
        {
          $match: {
            status: OrderStatus.COMPLETED,
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

    // Tạo map để tra cứu nhanh
    const salesMap = new Map<string, { totalQuantitySold: number; orderCount: number }>();
    salesData.forEach((item) => {
      const productId = item._id.toString();
      salesMap.set(productId, {
        totalQuantitySold: item.totalQuantitySold || 0,
        orderCount: item.orderCount || 0,
      });
    });

    // Tính toán recommendations cho từng sản phẩm
    const recommendations: PurchaseRecommendationItemDto[] = [];

    for (const product of products) {
      const productId = product._id.toString();
      const sales = salesMap.get(productId) || {
        totalQuantitySold: 0,
        orderCount: 0,
      };

      // Tính tốc độ bán hàng trung bình (số lượng/ngày)
      const averageDailySales =
        sales.totalQuantitySold / this.ANALYSIS_DAYS;

      // Tính số lượng nên nhập
      const recommendedQuantity = this.calculateRecommendedQuantity(
        product,
        averageDailySales,
      );

      // Xác định priority và lý do
      const { priority, reason } = this.determinePriority(
        product,
        averageDailySales,
        sales.totalQuantitySold,
      );

      // Chỉ thêm vào danh sách nếu có lý do nhập hàng
      if (recommendedQuantity > 0 || priority === 'high') {
        recommendations.push({
          productId,
          productName: product.name,
          currentStock: product.stock,
          minStockLevel: product.minStockLevel || 10,
          averageDailySales: Math.round(averageDailySales * 10) / 10,
          totalSoldLast30Days: sales.totalQuantitySold,
          recommendedQuantity: Math.max(0, Math.ceil(recommendedQuantity)),
          priority,
          reason,
          suggestedPurchasePrice: product.purchasePrice,
        });
      }
    }

    // Phân loại theo priority
    const highPriority = recommendations.filter((r) => r.priority === 'high');
    const mediumPriority = recommendations.filter(
      (r) => r.priority === 'medium',
    );
    const lowPriority = recommendations.filter((r) => r.priority === 'low');

    // Sắp xếp: High priority theo recommendedQuantity giảm dần
    highPriority.sort((a, b) => b.recommendedQuantity - a.recommendedQuantity);
    mediumPriority.sort((a, b) => b.recommendedQuantity - a.recommendedQuantity);
    lowPriority.sort((a, b) => b.recommendedQuantity - a.recommendedQuantity);

    this.logger.log(
      `Generated recommendations: ${highPriority.length} high, ${mediumPriority.length} medium, ${lowPriority.length} low`,
    );

    return {
      highPriority,
      mediumPriority,
      lowPriority,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Tính số lượng nên nhập dựa trên công thức:
   * (Average Daily Sales × Lead Time) + Safety Stock - Current Stock
   */
  private calculateRecommendedQuantity(
    product: ProductDocument,
    averageDailySales: number,
  ): number {
    const currentStock = product.stock || 0;
    const minStockLevel = product.minStockLevel || 10;

    // Nếu tồn kho đã đủ cho nhiều ngày, không cần nhập
    if (currentStock >= minStockLevel * 2 && averageDailySales === 0) {
      return 0;
    }

    // Tính safety stock dựa trên tốc độ bán hàng
    const safetyStock =
      averageDailySales > 0
        ? Math.ceil(
            averageDailySales * this.LEAD_TIME_DAYS * this.SAFETY_STOCK_MULTIPLIER,
          )
        : minStockLevel;

    // Số lượng cần để đáp ứng bán hàng trong thời gian lead time
    const demandDuringLeadTime = averageDailySales * this.LEAD_TIME_DAYS;

    // Tổng số lượng nên có
    const targetStock = Math.max(
      minStockLevel * 2, // Ít nhất là 2 lần minStockLevel
      demandDuringLeadTime + safetyStock,
    );

    // Số lượng cần nhập
    const recommendedQuantity = Math.ceil(targetStock - currentStock);

    return Math.max(0, recommendedQuantity);
  }

  /**
   * Xác định mức độ ưu tiên và lý do
   */
  private determinePriority(
    product: ProductDocument,
    averageDailySales: number,
    totalSoldLast30Days: number,
  ): { priority: 'high' | 'medium' | 'low'; reason: string } {
    const currentStock = product.stock || 0;
    const minStockLevel = product.minStockLevel || 10;
    const stockRatio = currentStock / (minStockLevel || 1);

    // High Priority: Tồn kho thấp + bán chạy
    if (stockRatio <= 1 && totalSoldLast30Days >= 20) {
      return {
        priority: 'high',
        reason: 'Bán chạy và tồn kho thấp - cần nhập gấp',
      };
    }

    if (stockRatio <= 0.5 && averageDailySales > 0) {
      return {
        priority: 'high',
        reason: 'Tồn kho rất thấp - cần nhập gấp',
      };
    }

    // High Priority: Bán rất chạy nhưng tồn kho sắp hết
    if (totalSoldLast30Days >= 50 && stockRatio <= 2) {
      return {
        priority: 'high',
        reason: 'Sản phẩm bán rất chạy - cần tăng tồn kho',
      };
    }

    // Medium Priority: Tồn kho gần hết hoặc bán vừa
    if (stockRatio <= 1.5 && totalSoldLast30Days >= 10) {
      return {
        priority: 'medium',
        reason: 'Tồn kho gần hết và có nhu cầu bán hàng',
      };
    }

    if (stockRatio <= 2 && averageDailySales > 0) {
      return {
        priority: 'medium',
        reason: 'Tồn kho đang giảm - nên nhập sớm',
      };
    }

    // Low Priority: Bán chậm hoặc tồn kho đủ
    if (totalSoldLast30Days > 0 && totalSoldLast30Days < 10) {
      return {
        priority: 'low',
        reason: 'Bán chậm - nên nhập ít để tránh tồn kho',
      };
    }

    if (averageDailySales === 0 && currentStock > minStockLevel) {
      return {
        priority: 'low',
        reason: 'Không có nhu cầu bán hàng gần đây',
      };
    }

    // Mặc định: Medium nếu có nhu cầu nhưng không urgent
    return {
      priority: 'medium',
      reason: 'Duy trì tồn kho theo nhu cầu bán hàng',
    };
  }

  /**
   * Lấy gợi ý cho sản phẩm cần nhập gấp (high priority only)
   */
  async getHighPriorityRecommendations(): Promise<
    PurchaseRecommendationItemDto[]
  > {
    const recommendations = await this.getRecommendations();
    return recommendations.highPriority;
  }

  /**
   * Lấy gợi ý cho sản phẩm nên nhập ít (low priority)
   */
  async getLowPriorityRecommendations(): Promise<
    PurchaseRecommendationItemDto[]
  > {
    const recommendations = await this.getRecommendations();
    return recommendations.lowPriority;
  }
}

