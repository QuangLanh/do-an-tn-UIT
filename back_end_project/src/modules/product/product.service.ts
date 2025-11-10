import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateStockDto, StockOperation } from './dto/update-stock.dto';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
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
    updateProductDto: UpdateProductDto,
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
    updateStockDto: UpdateStockDto,
  ): Promise<ProductDocument> {
    const product = await this.findOne(id);

    let newStock = product.stock;

    switch (updateStockDto.operation) {
      case StockOperation.ADD:
        newStock += updateStockDto.quantity;
        break;
      case StockOperation.SUBTRACT:
        newStock -= updateStockDto.quantity;
        if (newStock < 0) {
          throw new BadRequestException('Insufficient stock');
        }
        break;
      case StockOperation.SET:
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

