import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { TaoSanPhamDto } from './dto/tao-san-pham.dto';
import { CapNhatSanPhamDto } from './dto/cap-nhat-san-pham.dto';
import { CapNhatTonKhoDto, ThaoTacTonKho } from './dto/cap-nhat-ton-kho.dto';

@Injectable()
export class DichVuSanPham {
  private readonly logger = new Logger(DichVuSanPham.name);

  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async create(createProductDto: TaoSanPhamDto): Promise<Product> {
    const product = new this.productModel(createProductDto);
    const savedProduct = await product.save();
    this.logger.log(`Product created: ${savedProduct.name}`);
    return savedProduct;
  }

  async findAll(query?: any): Promise<Product[]> {
    const filter: any = {};

    if (query?.category) {
      filter.category = query.category;
    }

    if (query?.search) {
      filter.$text = { $search: query.search };
    }

    if (query?.lowStock) {
      filter.$expr = { $lte: ['$stock', '$minStockLevel'] };
    }

    return this.productModel.find(filter).exec();
  }

  async findOne(id: string): Promise<ProductDocument> {
    const product = await this.productModel.findById(id).exec();

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(
    id: string,
    updateProductDto: CapNhatSanPhamDto,
  ): Promise<Product> {
    const product = await this.productModel
      .findByIdAndUpdate(id, updateProductDto, { new: true })
      .exec();

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    this.logger.log(`Product updated: ${product.name}`);
    return product;
  }

  async remove(id: string): Promise<void> {
    const result = await this.productModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException('Product not found');
    }

    this.logger.log(`Product deleted: ${result.name}`);
  }

  async updateStock(
    id: string,
    updateStockDto: CapNhatTonKhoDto,
  ): Promise<ProductDocument> {
    const product = await this.findOne(id);

    let newStock = product.stock;

    switch (updateStockDto.operation) {
      case ThaoTacTonKho.ADD:
        newStock += updateStockDto.quantity;
        break;
      case ThaoTacTonKho.SUBTRACT:
        newStock -= updateStockDto.quantity;
        if (newStock < 0) {
          throw new BadRequestException('Insufficient stock');
        }
        break;
      case ThaoTacTonKho.SET:
        newStock = updateStockDto.quantity;
        break;
    }

    product.stock = newStock;
    await product.save();

    this.logger.log(
      `Stock updated for ${product.name}: ${product.stock} (${updateStockDto.operation} ${updateStockDto.quantity})`,
    );

    return product;
  }

  async getLowStockProducts(): Promise<ProductDocument[]> {
    return this.productModel
      .find({
        $expr: { $lte: ['$stock', '$minStockLevel'] },
      })
      .exec();
  }

  async getCategories(): Promise<string[]> {
    return this.productModel.distinct('category').exec();
  }
}

