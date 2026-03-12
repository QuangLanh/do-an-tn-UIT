import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Purchase, PurchaseDocument } from './schemas/purchase.schema';
import { TaoNhapHangDto } from './dto/tao-nhap-hang.dto';
import { NhanHangDto } from './dto/nhan-hang.dto';
import { DichVuSanPham } from '../san-pham/san-pham.dich-vu';
import { ThaoTacTonKho } from '../san-pham/dto/cap-nhat-ton-kho.dto';
import { TrangThaiNhapHang } from '../../dung-chung/liet-ke/trang-thai-nhap-hang.enum';
import { DichVuLichSuThaoTac } from '../lich-su-thao-tac/lich-su.dich-vu';
import { DichVuStockBatch } from './stock-batch.dich-vu';

@Injectable()
export class DichVuNhapHang {
  private readonly logger = new Logger(DichVuNhapHang.name);

  constructor(
    @InjectModel(Purchase.name) private purchaseModel: Model<PurchaseDocument>,
    private dichVuSanPham: DichVuSanPham,
    private dichVuLichSu: DichVuLichSuThaoTac,
    private dichVuStockBatch: DichVuStockBatch,
  ) {}

  private async generatePurchaseNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const prefix = `PUR${year}${month}${day}`;

    // Không dùng countDocuments() vì sẽ bị trùng khi có bản ghi bị xóa
    // hoặc khi nhiều request tạo cùng lúc.
    const latestToday = await this.purchaseModel
      .findOne({ purchaseNumber: new RegExp(`^${prefix}\\d{4}$`) })
      .sort({ purchaseNumber: -1 })
      .select('purchaseNumber')
      .lean()
      .exec();

    let nextSeq = 1;
    if (latestToday?.purchaseNumber) {
      const last4 = latestToday.purchaseNumber.slice(-4);
      const parsed = Number(last4);
      if (Number.isFinite(parsed) && parsed > 0) {
        nextSeq = parsed + 1;
      }
    }

    const purchaseNum = String(nextSeq).padStart(4, '0');
    return `${prefix}${purchaseNum}`;
  }

  private isDuplicatePurchaseNumberError(error: any): boolean {
    return Boolean(
      error &&
      error.code === 11000 &&
      typeof error.message === 'string' &&
      error.message.includes('purchaseNumber')
    );
  }

  async create(createPurchaseDto: TaoNhapHangDto, userId: string, userFullName: string = 'Hệ thống'): Promise<Purchase> {
    // Validate and calculate purchase items
    const purchaseItems = [];
    let total = 0;

    for (const item of createPurchaseDto.items) {
      const product = await this.dichVuSanPham.findOne(item.productId);

      const itemSubtotal = item.purchasePrice * item.quantity;
      total += itemSubtotal;

      purchaseItems.push({
        product: new Types.ObjectId(item.productId),
        productName: product.name,
        quantity: item.quantity,
        orderedQuantity: item.quantity,
        purchasePrice: item.purchasePrice,
        subtotal: itemSubtotal,
      });
    }

    // Tất cả phiếu nhập đều bắt đầu "pending" - chờ nhận hàng thực tế
    const initialStatus = TrangThaiNhapHang.PENDING;

    const basePayload = {
      items: purchaseItems,
      supplier: createPurchaseDto.supplier,
      supplierId: createPurchaseDto.supplierId
        ? new Types.ObjectId(createPurchaseDto.supplierId)
        : undefined,
      supplierNameSnapshot: createPurchaseDto.supplier,
      supplierContact: createPurchaseDto.supplierContact,
      total,
      notes: createPurchaseDto.notes,
      status: initialStatus,
      createdBy: new Types.ObjectId(userId),
    };

    // Retry khi đụng unique index purchaseNumber trong tình huống race condition
    let savedPurchase: PurchaseDocument | null = null;
    const MAX_RETRIES = 5;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      const purchaseNumber = await this.generatePurchaseNumber();
      const purchase = new this.purchaseModel({
        ...basePayload,
        purchaseNumber,
      });
      try {
        savedPurchase = await purchase.save();
        break;
      } catch (error: any) {
        if (this.isDuplicatePurchaseNumberError(error) && attempt < MAX_RETRIES) {
          this.logger.warn(`Duplicate purchaseNumber (${purchaseNumber}), retry ${attempt}/${MAX_RETRIES}`);
          continue;
        }
        throw error;
      }
    }

    if (!savedPurchase) {
      throw new BadRequestException('Không thể tạo mã phiếu nhập duy nhất. Vui lòng thử lại.');
    }

    // Không cập nhật tồn kho ở đây - chỉ cập nhật khi đổi trạng thái sang "hoàn thành" (trong update)

    this.logger.log(`Purchase created: ${savedPurchase.purchaseNumber} (status: ${initialStatus})`);
    await this.dichVuLichSu.log({
      userId,
      userFullName,
      action: 'Tạo phiếu nhập hàng',
      entityType: 'purchase',
      entityId: (savedPurchase as any)._id?.toString(),
      entityName: savedPurchase.purchaseNumber,
      details: `NCC: ${savedPurchase.supplier}, Tổng: ${savedPurchase.total}`,
    }).catch(() => {});
    return savedPurchase;
  }

  async findAll(query?: any): Promise<Purchase[]> {
    const filter: any = {};

    if (query?.supplier) {
      filter.supplier = new RegExp(query.supplier, 'i');
    }

    if (query?.from || query?.to) {
      filter.createdAt = {};
      if (query.from) {
        filter.createdAt.$gte = new Date(query.from);
      }
      if (query.to) {
        filter.createdAt.$lte = new Date(query.to);
      }
    }

    return this.purchaseModel
      .find(filter)
      .populate('createdBy', 'fullName email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<Purchase> {
    const purchase = await this.purchaseModel
      .findById(id)
      .populate('createdBy', 'fullName email')
      .populate('items.product')
      .exec();

    if (!purchase) {
      throw new NotFoundException('Purchase not found');
    }

    return purchase;
  }

  async getStatistics(from?: Date, to?: Date): Promise<any> {
    const matchStage: any = {
      status: { $in: [TrangThaiNhapHang.RECEIVED, 'completed'] },
    };

    if (from || to) {
      matchStage.createdAt = {};
      if (from) matchStage.createdAt.$gte = from;
      if (to) matchStage.createdAt.$lte = to;
    }

    const result = await this.purchaseModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalCost: { $sum: '$total' },
          totalPurchases: { $sum: 1 },
          averagePurchaseValue: { $avg: '$total' },
        },
      },
    ]);

    return result[0] || { totalCost: 0, totalPurchases: 0, averagePurchaseValue: 0 };
  }

  async getSuppliers(): Promise<string[]> {
    return this.purchaseModel.distinct('supplier').exec();
  }

  async update(id: string, updateData: any): Promise<Purchase> {
    const existingPurchase = await this.purchaseModel.findById(id).exec();
    if (!existingPurchase) {
      throw new NotFoundException('Purchase not found');
    }

    const newStatus = updateData.status;
    const wasPending =
      existingPurchase.status === TrangThaiNhapHang.PENDING ||
      existingPurchase.status === 'requesting';
    const isNowReceived =
      newStatus === TrangThaiNhapHang.RECEIVED ||
      newStatus === TrangThaiNhapHang.COMPLETED;

    // Legacy support: nếu vẫn dùng PATCH status cũ thì cập nhật tồn kho và tạo lô.
    if (wasPending && isNowReceived && existingPurchase.items?.length) {
      const purchaseIdStr = (existingPurchase as any)._id?.toString?.() || '';
      for (const item of existingPurchase.items) {
        const raw = (item as any).product;
        const productId = typeof raw === 'string' ? raw : (raw?._id || raw)?.toString?.() || '';
        if (productId && item.quantity > 0) {
          await this.dichVuSanPham.updateStock(productId, {
            operation: ThaoTacTonKho.ADD,
            quantity: item.quantity,
          });
          const mfg = item.manufactureDate ? new Date(item.manufactureDate) : new Date();
          const exp = item.expiryDate ? new Date(item.expiryDate) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
          await this.dichVuStockBatch.createBatch({
            productId,
            productName: item.productName || '',
            quantity: item.quantity,
            manufactureDate: mfg,
            expiryDate: exp,
            purchaseId: purchaseIdStr,
            purchaseNumber: existingPurchase.purchaseNumber,
            lotNumber: item.lotNumber,
          });
          await this.dichVuSanPham.update(productId, {
            purchasePrice: item.purchasePrice,
          });
        }
      }
      this.logger.log(`Purchase ${existingPurchase.purchaseNumber} received: stock & cost updated`);
    }

    // Khi cập nhật items (vd: đổi NCC), frontend gửi productId nhưng không gửi productName.
    // Cần bổ sung productName từ Product để modal "Nhận hàng thực tế" hiển thị đúng tên.
    if (Array.isArray(updateData.items) && updateData.items.length > 0) {
      const normalizedItems = [];
      let total = 0;
      for (const it of updateData.items) {
        const productId = String(it.productId || it.product || '').trim();
        if (!productId) continue;
        const product = await this.dichVuSanPham.findOne(productId);
        const qty = Number(it.quantity ?? 0);
        const price = Number(it.purchasePrice ?? it.unitPrice ?? 0);
        const subtotal = qty * price;
        total += subtotal;
        normalizedItems.push({
          product: new Types.ObjectId(productId),
          productName: product?.name ?? it.productName ?? 'Sản phẩm',
          quantity: qty,
          orderedQuantity: it.orderedQuantity ?? qty,
          purchasePrice: price,
          subtotal,
        });
      }
      updateData.items = normalizedItems;
      updateData.total = total;
    }

    const purchase = await this.purchaseModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();

    if (!purchase) {
      throw new NotFoundException('Purchase not found');
    }

    this.logger.log(`Purchase updated: ${purchase.purchaseNumber}`);
    return purchase;
  }

  async remove(
    id: string,
    userId: string,
    userFullName: string = 'Nhân viên',
  ): Promise<void> {
    const result = await this.purchaseModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException('Purchase not found');
    }

    this.logger.log(`Purchase deleted: ${result.purchaseNumber}`);
    await this.dichVuLichSu.log({
      userId,
      userFullName,
      action: 'Xóa phiếu nhập hàng',
      entityType: 'purchase',
      entityId: id,
      entityName: result.purchaseNumber,
    }).catch(() => {});
  }

  async getPriceHistory(productId: string): Promise<any[]> {
    const purchases = await this.purchaseModel
      .find({
        'items.product': productId,
        status: { $in: [TrangThaiNhapHang.RECEIVED, 'completed'] },
      })
      .sort({ createdAt: -1 })
      .exec();

    const history: any[] = [];
    for (const purchase of purchases) {
      for (const item of purchase.items) {
        const rawId = (item.product as any)?._id?.toString?.() || item.product?.toString?.() || '';
        if (rawId === productId || rawId.endsWith(productId) || productId.endsWith(rawId)) {
          history.push({
            purchaseId: (purchase as any)._id?.toString(),
            purchaseNumber: purchase.purchaseNumber,
            purchaseDate: (purchase as any).createdAt,
            supplier: purchase.supplier,
            supplierId: purchase.supplierId?.toString(),
            purchasePrice: item.purchasePrice,
            quantity: item.quantity,
            lotNumber: item.lotNumber,
          });
        }
      }
    }
    return history;
  }

  async getExpiryWarnings(days: number = 7): Promise<any> {
    return this.dichVuStockBatch.getExpiryWarnings(days);
  }

  /**
   * Trả về trạng thái hạn sử dụng theo từng sản phẩm (từ StockBatch).
   * Dùng cho: trang tồn kho (badge), chặn bán hàng hết hạn, gợi ý nhập hàng.
   */
  async getProductExpiryStatusMap(days: number = 7): Promise<
    Record<string, { status: 'expired' | 'near_expiry' | 'critical' | 'normal'; expiredQty: number; nearExpiryQty: number }>
  > {
    try {
      const batchMap = await this.dichVuStockBatch.getProductExpiryStatusMap(days);
      const result: Record<string, any> = {};
      for (const [productId, data] of Object.entries(batchMap)) {
        result[productId] = {
          status: data.status,
          expiredQty: data.expiredQty ?? 0,
          nearExpiryQty: (data.nearExpiryQty ?? 0) + (data.criticalQty ?? 0),
        };
      }
      return result;
    } catch (e) {
      this.logger.warn(`getProductExpiryStatusMap failed: ${(e as Error).message}`);
      return {};
    }
  }

  /**
   * Loại bỏ hàng hết hạn: trừ từ batches, cập nhật product.stock, ghi log.
   */
  async removeExpiredStock(
    productId: string,
    userId: string,
    userFullName: string = 'Hệ thống',
  ): Promise<{ removedQty: number; productName: string }> {
    const { removedQty, productName } = await this.dichVuStockBatch.removeExpiredFromBatches(productId);

    await this.dichVuLichSu.log({
      userId,
      userFullName,
      action: 'Loại bỏ hàng hết hạn',
      entityType: 'product',
      entityId: productId,
      entityName: productName,
      details: `expired: ${removedQty}`,
    }).catch(() => {});

    return { removedQty, productName };
  }

  async receiveGoods(
    id: string,
    receiveDto: NhanHangDto,
    userId: string,
    userFullName: string = 'Nhân viên',
  ): Promise<Purchase> {
    const purchase = await this.purchaseModel.findById(id).exec();
    if (!purchase) {
      throw new NotFoundException('Purchase not found');
    }

    if (purchase.status !== TrangThaiNhapHang.PENDING && purchase.status !== 'requesting') {
      throw new BadRequestException('Chỉ phiếu ở trạng thái pending mới được nhận hàng');
    }

    if (!receiveDto.items?.length) {
      throw new BadRequestException('Danh sách nhận hàng không được để trống');
    }

    const itemMap = new Map<string, any>();
    for (const line of receiveDto.items) {
      const key = String(line.productId);
      itemMap.set(key, line);
    }

    let recalculatedTotal = 0;
    for (const item of purchase.items) {
      const rawProductId = (item as any).product?._id?.toString?.() || (item as any).product?.toString?.() || '';
      const receiveLine = itemMap.get(rawProductId);
      if (!receiveLine) {
        throw new BadRequestException(`Thiếu dữ liệu nhận hàng cho sản phẩm ${item.productName}`);
      }

      if (receiveLine.receivedQuantity < 0) {
        throw new BadRequestException(`Số lượng nhận của ${item.productName} phải >= 0`);
      }

      const mfg = new Date(receiveLine.manufactureDate);
      const exp = new Date(receiveLine.expiryDate);
      if (Number.isNaN(mfg.getTime()) || Number.isNaN(exp.getTime())) {
        throw new BadRequestException(`Ngày sản xuất/hạn sử dụng của ${item.productName} không hợp lệ`);
      }
      if (exp <= mfg) {
        throw new BadRequestException(`Hạn sử dụng của ${item.productName} phải lớn hơn ngày sản xuất`);
      }

      const receivedQuantity = Number(receiveLine.receivedQuantity);
      const actualPrice = Number(receiveLine.actualPurchasePrice);
      const subtotal = receivedQuantity * actualPrice;
      recalculatedTotal += subtotal;

      // Giữ lại orderedQuantity để kiểm soát sai lệch thực nhận
      (item as any).orderedQuantity = (item as any).orderedQuantity ?? item.quantity;
      item.quantity = receivedQuantity;
      item.purchasePrice = actualPrice;
      item.subtotal = subtotal;
      item.manufactureDate = mfg;
      item.expiryDate = exp;
      item.lotNumber = receiveLine.lotNumber;
    }

    // Cập nhật tồn kho và tạo lô hàng (Batch) theo số lượng thực nhận
    const purchaseIdStr = (purchase as any)._id?.toString?.() || '';
    for (const item of purchase.items) {
      const raw = (item as any).product;
      const productId = typeof raw === 'string' ? raw : (raw?._id || raw)?.toString?.() || '';
      if (!productId) continue;

      if (item.quantity > 0) {
        await this.dichVuSanPham.updateStock(productId, {
          operation: ThaoTacTonKho.ADD,
          quantity: item.quantity,
        });
        await this.dichVuStockBatch.createBatch({
          productId,
          productName: item.productName || '',
          quantity: item.quantity,
          manufactureDate: item.manufactureDate || new Date(),
          expiryDate: item.expiryDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          purchaseId: purchaseIdStr,
          purchaseNumber: purchase.purchaseNumber,
          lotNumber: item.lotNumber,
        });
      }
      await this.dichVuSanPham.update(productId, {
        purchasePrice: item.purchasePrice,
      });
    }

    purchase.total = recalculatedTotal;
    purchase.status = TrangThaiNhapHang.RECEIVED;
    if (receiveDto.notes) purchase.notes = receiveDto.notes;

    const saved = await purchase.save();
    this.logger.log(`Purchase received: ${saved.purchaseNumber}`);
    await this.dichVuLichSu.log({
      userId,
      userFullName,
      action: 'Nhận hàng phiếu nhập',
      entityType: 'purchase',
      entityId: (saved as any)._id?.toString(),
      entityName: saved.purchaseNumber,
      details: `Tổng thực nhận: ${saved.total}`,
    }).catch(() => {});

    return saved;
  }
}

