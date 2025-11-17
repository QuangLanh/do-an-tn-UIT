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
      });
    }

    // Generate purchase number
    const purchaseNumber = await this.generatePurchaseNumber();

    // Create purchase
    const purchase = new this.purchaseModel({
      purchaseNumber,
      items: purchaseItems,
      supplier: createPurchaseDto.supplier,
      supplierContact: createPurchaseDto.supplierContact,
      total,
      notes: createPurchaseDto.notes,
      status: 'completed',
      createdBy: new Types.ObjectId(userId),
    });

    const savedPurchase = await purchase.save();

    // Update product stock and purchase price
    for (const item of createPurchaseDto.items) {
      await this.dichVuSanPham.updateStock(item.productId, {
        operation: ThaoTacTonKho.ADD,
        quantity: item.quantity,
      });

      // Optionally update the purchase price in product
      await this.dichVuSanPham.update(item.productId, {
        purchasePrice: item.purchasePrice,
      });
    }

    this.logger.log(`Purchase created: ${savedPurchase.purchaseNumber}`);
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
      status: 'completed',
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

