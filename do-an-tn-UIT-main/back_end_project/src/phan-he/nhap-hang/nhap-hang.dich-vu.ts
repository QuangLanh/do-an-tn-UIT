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
import { DichVuSanPham } from '../san-pham/san-pham.dich-vu';
import { ThaoTacTonKho } from '../san-pham/dto/cap-nhat-ton-kho.dto';
import { TrangThaiNhapHang } from '../../dung-chung/liet-ke/trang-thai-nhap-hang.enum';

@Injectable()
export class DichVuNhapHang {
  private readonly logger = new Logger(DichVuNhapHang.name);

  constructor(
    @InjectModel(Purchase.name) private purchaseModel: Model<PurchaseDocument>,
    private dichVuSanPham: DichVuSanPham,
  ) {}

  private async generatePurchaseNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    const count = await this.purchaseModel.countDocuments();
    const purchaseNum = (count + 1).toString().padStart(4, '0');

    return `PUR${year}${month}${day}${purchaseNum}`;
  }

  async create(createPurchaseDto: TaoNhapHangDto, userId: string): Promise<Purchase> {
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
        purchasePrice: item.purchasePrice,
        subtotal: itemSubtotal,
        expiryDate: item.expiryDate ? new Date(item.expiryDate) : undefined,
        manufactureDate: item.manufactureDate ? new Date(item.manufactureDate) : undefined,
        lotNumber: item.lotNumber,
      });
    }

    // Generate purchase number
    const purchaseNumber = await this.generatePurchaseNumber();

    // Tất cả phiếu nhập đều bắt đầu "đang yêu cầu" - chờ NCC giao hàng
    const initialStatus = TrangThaiNhapHang.REQUESTING;

    // Create purchase
    const purchase = new this.purchaseModel({
      purchaseNumber,
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
    });

    const savedPurchase = await purchase.save();

    // Không cập nhật tồn kho ở đây - chỉ cập nhật khi đổi trạng thái sang "hoàn thành" (trong update)

    this.logger.log(`Purchase created: ${savedPurchase.purchaseNumber} (status: ${initialStatus})`);
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
      status: TrangThaiNhapHang.COMPLETED,
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
    const wasRequesting = existingPurchase.status === TrangThaiNhapHang.REQUESTING;
    const isNowCompleted = newStatus === TrangThaiNhapHang.COMPLETED;

    // Chuyển từ "đang yêu cầu" → "hoàn thành": cập nhật tồn kho + giá vốn
    if (wasRequesting && isNowCompleted && existingPurchase.items?.length) {
      for (const item of existingPurchase.items) {
        const raw = (item as any).product;
        const productId = typeof raw === 'string' ? raw : (raw?._id || raw)?.toString?.() || '';
        if (productId) {
          await this.dichVuSanPham.updateStock(productId, {
            operation: ThaoTacTonKho.ADD,
            quantity: item.quantity,
          });
          await this.dichVuSanPham.update(productId, {
            purchasePrice: item.purchasePrice,
          });
        }
      }
      this.logger.log(`Purchase ${existingPurchase.purchaseNumber} completed: stock & cost updated`);
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

  async remove(id: string): Promise<void> {
    const result = await this.purchaseModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException('Purchase not found');
    }

    this.logger.log(`Purchase deleted: ${result.purchaseNumber}`);
  }
}

