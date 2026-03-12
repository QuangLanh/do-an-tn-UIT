import {
  Injectable,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { StockBatch, StockBatchDocument, ExpiryStatus } from './schemas/stock-batch.schema';
import { DichVuSanPham } from '../san-pham/san-pham.dich-vu';
import { ThaoTacTonKho } from '../san-pham/dto/cap-nhat-ton-kho.dto';

/** Ngưỡng ngày: normal > 30, near_expiry 7-30, critical <= 7, expired < 0 */
const DAYS_NORMAL = 30;
const DAYS_NEAR_EXPIRY = 7;
const DAYS_CRITICAL = 7;

@Injectable()
export class DichVuStockBatch {
  private readonly logger = new Logger(DichVuStockBatch.name);

  constructor(
    @InjectModel(StockBatch.name) private batchModel: Model<StockBatchDocument>,
    private dichVuSanPham: DichVuSanPham,
  ) {}

  /**
   * Tính trạng thái hạn sử dụng theo số ngày còn lại
   * normal: > 30 ngày
   * near_expiry: 7-30 ngày
   * critical: <= 7 ngày
   * expired: đã hết hạn
   */
  getExpiryStatus(daysUntilExpiry: number): ExpiryStatus {
    if (daysUntilExpiry < 0) return 'expired';
    if (daysUntilExpiry <= DAYS_CRITICAL) return 'critical';
    if (daysUntilExpiry <= DAYS_NORMAL) return 'near_expiry';
    return 'normal';
  }

  /**
   * Tạo lô hàng khi nhận hàng
   */
  async createBatch(params: {
    productId: string;
    productName: string;
    quantity: number;
    manufactureDate: Date;
    expiryDate: Date;
    purchaseId: string;
    purchaseNumber?: string;
    lotNumber?: string;
  }): Promise<StockBatch> {
    const batch = new this.batchModel({
      product: new Types.ObjectId(params.productId),
      productName: params.productName,
      quantity: params.quantity,
      manufactureDate: params.manufactureDate,
      expiryDate: params.expiryDate,
      purchaseId: params.purchaseId ? new Types.ObjectId(params.purchaseId) : undefined,
      purchaseNumber: params.purchaseNumber,
      receivedAt: new Date(),
      lotNumber: params.lotNumber,
    });
    return batch.save();
  }

  /**
   * Lấy các lô còn tồn (quantity > 0) của sản phẩm, sắp xếp FEFO (expiryDate tăng dần)
   */
  async getAvailableBatches(productId: string): Promise<any[]> {
    const now = new Date();
    return this.batchModel
      .find({
        product: new Types.ObjectId(productId),
        quantity: { $gt: 0 },
        expiryDate: { $gt: now },
      })
      .sort({ expiryDate: 1 })
      .exec();
  }

  /**
   * Lấy tất cả lô của sản phẩm (kể cả hết hạn, đã hết) để hiển thị chi tiết
   */
  async getBatchesByProduct(productId: string): Promise<any[]> {
    const batches = await this.batchModel
      .find({ product: new Types.ObjectId(productId), quantity: { $gt: 0 } })
      .sort({ expiryDate: 1 })
      .lean()
      .exec();

    const now = new Date();
    return batches.map((b: any) => {
      const expiry = new Date(b.expiryDate);
      const daysUntil = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const status = this.getExpiryStatus(daysUntil);
      return {
        ...b,
        id: b._id?.toString(),
        daysUntilExpiry: daysUntil,
        status,
      };
    });
  }

  /**
   * Trừ tồn kho theo FEFO. Trả về true nếu đủ, throw nếu không đủ hoặc có hàng hết hạn.
   */
  async deductFEFO(
    productId: string,
    quantity: number,
  ): Promise<void> {
    const product = await this.dichVuSanPham.findOne(productId);
    if (!product || product.stock < quantity) {
      throw new BadRequestException('Insufficient stock');
    }

    const batches = await this.batchModel
      .find({
        product: new Types.ObjectId(productId),
        quantity: { $gt: 0 },
      })
      .sort({ expiryDate: 1 })
      .exec();

    const now = new Date();
    let remaining = quantity;

    for (const batch of batches) {
      if (remaining <= 0) break;

      const expiry = new Date(batch.expiryDate);
      if (expiry < now) {
        throw new BadRequestException(
          `Không thể bán sản phẩm "${product.name}" - có lô hàng đã hết hạn. Vui lòng loại bỏ hàng hết hạn trước.`,
        );
      }

      const toDeduct = Math.min(remaining, batch.quantity);
      if (toDeduct > 0) {
        batch.quantity -= toDeduct;
        await batch.save();
        remaining -= toDeduct;
      }
    }

    if (remaining > 0) {
      throw new BadRequestException('Insufficient stock (FEFO)');
    }

    await this.dichVuSanPham.updateStock(productId, {
      operation: ThaoTacTonKho.SUBTRACT,
      quantity,
    });
  }

  /**
   * Kiểm tra sản phẩm có lô hàng nào không (để dùng FEFO hay fallback)
   */
  async hasBatches(productId: string): Promise<boolean> {
    const count = await this.batchModel.countDocuments({
      product: new Types.ObjectId(productId),
      quantity: { $gt: 0 },
    });
    return count > 0;
  }

  /**
   * Kiểm tra sản phẩm có hàng hết hạn không (để chặn bán)
   */
  async hasExpiredStock(productId: string): Promise<boolean> {
    const now = new Date();
    const count = await this.batchModel.countDocuments({
      product: new Types.ObjectId(productId),
      quantity: { $gt: 0 },
      expiryDate: { $lt: now },
    });
    return count > 0;
  }

  /**
   * Trạng thái hạn sử dụng theo sản phẩm (từ batches)
   */
  async getProductExpiryStatusMap(days: number = 7): Promise<
    Record<string, {
      status: ExpiryStatus;
      expiredQty: number;
      nearExpiryQty: number;
      criticalQty: number;
      normalQty: number;
    }>
  > {
    const now = new Date();
    const batches = await this.batchModel
      .find({ quantity: { $gt: 0 } })
      .lean()
      .exec();

    const map: Record<string, { expiredQty: number; nearExpiryQty: number; criticalQty: number; normalQty: number }> = {};

    for (const b of batches) {
      const productId = (b as any).product?.toString?.() || '';
      if (!productId) continue;

      if (!map[productId]) {
        map[productId] = { expiredQty: 0, nearExpiryQty: 0, criticalQty: 0, normalQty: 0 };
      }

      const qty = Number((b as any).quantity ?? 0);
      const expiry = new Date((b as any).expiryDate);
      const daysUntil = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntil < 0) {
        map[productId].expiredQty += qty;
      } else if (daysUntil <= DAYS_CRITICAL) {
        map[productId].criticalQty += qty;
      } else if (daysUntil <= DAYS_NORMAL) {
        map[productId].nearExpiryQty += qty;
      } else {
        map[productId].normalQty += qty;
      }
    }

    const result: Record<string, any> = {};
    for (const [productId, data] of Object.entries(map)) {
      const status: ExpiryStatus =
        data.expiredQty > 0 ? 'expired' :
          data.criticalQty > 0 ? 'critical' :
            data.nearExpiryQty > 0 ? 'near_expiry' : 'normal';
      result[productId] = { ...data, status };
    }
    return result;
  }

  /**
   * Cảnh báo hạn sử dụng (từ batches)
   */
  async getExpiryWarnings(days: number = 7): Promise<{
    expiredCount: number;
    expiringCount: number;
    criticalCount: number;
    expiredItems: any[];
    expiringItems: any[];
    criticalItems: any[];
  }> {
    const now = new Date();
    const batches = await this.batchModel
      .find({ quantity: { $gt: 0 } })
      .lean()
      .exec();

    const expiredItems: any[] = [];
    const expiringItems: any[] = [];
    const criticalItems: any[] = [];

    for (const b of batches) {
      const expiry = new Date((b as any).expiryDate);
      const daysUntil = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const entry = {
        productId: (b as any).product?.toString?.(),
        productName: (b as any).productName,
        batchId: (b as any)._id?.toString?.(),
        expiryDate: (b as any).expiryDate,
        manufactureDate: (b as any).manufactureDate,
        lotNumber: (b as any).lotNumber,
        purchaseId: (b as any).purchaseId?.toString?.(),
        purchaseNumber: (b as any).purchaseNumber,
        quantity: (b as any).quantity,
        daysUntilExpiry: daysUntil,
        status: this.getExpiryStatus(daysUntil),
      };

      if (daysUntil < 0) {
        expiredItems.push(entry);
      } else if (daysUntil <= DAYS_CRITICAL) {
        criticalItems.push(entry);
        expiringItems.push(entry);
      } else if (daysUntil <= days) {
        expiringItems.push(entry);
      }
    }

    return {
      expiredCount: expiredItems.length,
      expiringCount: expiringItems.length,
      criticalCount: criticalItems.length,
      expiredItems,
      expiringItems,
      criticalItems,
    };
  }

  /**
   * Loại bỏ hàng hết hạn: trừ từ batches, cập nhật product.stock, ghi log
   */
  async removeExpiredFromBatches(
    productId: string,
  ): Promise<{ removedQty: number; productName: string }> {
    const now = new Date();
    const expiredBatches = await this.batchModel
      .find({
        product: new Types.ObjectId(productId),
        quantity: { $gt: 0 },
        expiryDate: { $lt: now },
      })
      .exec();

    if (expiredBatches.length === 0) {
      const product = await this.dichVuSanPham.findOne(productId);
      throw new BadRequestException(
        `Sản phẩm "${product?.name || productId}" không có hàng hết hạn cần loại bỏ`,
      );
    }

    let totalRemoved = 0;
    for (const batch of expiredBatches) {
      totalRemoved += batch.quantity;
      batch.quantity = 0;
      await batch.save();
    }

    const product = await this.dichVuSanPham.findOne(productId);
    await this.dichVuSanPham.updateStock(productId, {
      operation: ThaoTacTonKho.SUBTRACT,
      quantity: totalRemoved,
    });

    this.logger.log(`Removed ${totalRemoved} expired stock for ${product?.name}`);
    return { removedQty: totalRemoved, productName: product?.name || 'Sản phẩm' };
  }

  /**
   * Tồn kho hiệu dụng = tổng số lượng các lô chưa hết hạn (để gợi ý nhập hàng)
   */
  async getEffectiveStock(productId: string): Promise<number> {
    const now = new Date();
    const result = await this.batchModel.aggregate([
      {
        $match: {
          product: new Types.ObjectId(productId),
          quantity: { $gt: 0 },
          expiryDate: { $gt: now },
        },
      },
      { $group: { _id: null, total: { $sum: '$quantity' } } },
    ]);
    return result[0]?.total ?? 0;
  }

  /**
   * Hoàn trả tồn kho (khi hủy đơn, trả hàng): thêm vào lô mới hoặc lô gần nhất
   */
  async addStockForReturn(
    productId: string,
    quantity: number,
    productName: string,
  ): Promise<void> {
    const product = await this.dichVuSanPham.findOne(productId);
    const now = new Date();
    const futureExpiry = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

    const batch = new this.batchModel({
      product: new Types.ObjectId(productId),
      productName: productName || product?.name,
      quantity,
      manufactureDate: now,
      expiryDate: futureExpiry,
      receivedAt: now,
      lotNumber: `RETURN-${Date.now()}`,
    });
    await batch.save();

    await this.dichVuSanPham.updateStock(productId, {
      operation: ThaoTacTonKho.ADD,
      quantity,
    });
  }
}
