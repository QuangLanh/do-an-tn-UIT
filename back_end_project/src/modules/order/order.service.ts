import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { ProductService } from '../product/product.service';
import { OrderStatus } from '../../common/enums/order-status.enum';
import { StockOperation } from '../product/dto/update-stock.dto';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private productService: ProductService,
  ) {}

  private async generateOrderNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    const count = await this.orderModel.countDocuments();
    const orderNum = (count + 1).toString().padStart(4, '0');

    return `ORD${year}${month}${day}${orderNum}`;
  }

  async create(
    createOrderDto: CreateOrderDto,
    userId: string,
  ): Promise<Order> {
    // Validate and calculate order items
    const orderItems = [];
    let subtotal = 0;

    for (const item of createOrderDto.items) {
      const product = await this.productService.findOne(item.productId);

      if (!product.isActive) {
        throw new BadRequestException(`Product ${product.name} is not active`);
      }

      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for ${product.name}. Available: ${product.stock}`,
        );
      }

      const itemSubtotal = product.salePrice * item.quantity;
      subtotal += itemSubtotal;

      orderItems.push({
        product: new Types.ObjectId(item.productId),
        productName: product.name,
        quantity: item.quantity,
        price: product.salePrice,
        subtotal: itemSubtotal,
      });
    }

    // Calculate total
    const tax = createOrderDto.tax || 0;
    const discount = createOrderDto.discount || 0;
    const total = subtotal + tax - discount;

    // Generate order number
    const orderNumber = await this.generateOrderNumber();

    // Create order
    const order = new this.orderModel({
      orderNumber,
      items: orderItems,
      subtotal,
      tax,
      discount,
      total,
      customerName: createOrderDto.customerName,
      customerPhone: createOrderDto.customerPhone,
      notes: createOrderDto.notes,
      paymentMethod: createOrderDto.paymentMethod,
      createdBy: new Types.ObjectId(userId),
      status: OrderStatus.COMPLETED,
    });

    const savedOrder = await order.save();

    // Update product stock
    for (const item of createOrderDto.items) {
      await this.productService.updateStock(item.productId, {
        operation: StockOperation.SUBTRACT,
        quantity: item.quantity,
      });
    }

    this.logger.log(`Order created: ${savedOrder.orderNumber}`);
    return savedOrder;
  }

  async findAll(query?: any): Promise<Order[]> {
    const filter: any = {};

    if (query?.status) {
      filter.status = query.status;
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

    return this.orderModel
      .find(filter)
      .populate('createdBy', 'fullName email')
      .populate('items.product')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderModel
      .findById(id)
      .populate('createdBy', 'fullName email')
      .populate('items.product')
      .exec();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async updateStatus(
    id: string,
    updateOrderStatusDto: UpdateOrderStatusDto,
  ): Promise<Order> {
    const order = await this.orderModel
      .findByIdAndUpdate(
        id,
        { status: updateOrderStatusDto.status },
        { new: true },
      )
      .exec();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    this.logger.log(
      `Order ${order.orderNumber} status updated to ${updateOrderStatusDto.status}`,
    );
    return order;
  }

  async getStatistics(from?: Date, to?: Date): Promise<any> {
    const filter: any = {
      status: OrderStatus.COMPLETED,
    };

    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = from;
      if (to) filter.createdAt.$lte = to;
    }

    const orders = await this.orderModel
      .find(filter)
      .populate('items.product', 'purchasePrice')
      .exec();

    if (!orders.length) {
      return {
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        totalCost: 0,
      };
    }

    let totalRevenue = 0;
    let totalCost = 0;
    const productCostCache = new Map<string, number>();

    const resolvePurchasePrice = async (item: any): Promise<number> => {
      const populatedProduct = item?.product;

      if (populatedProduct && typeof populatedProduct === 'object') {
        const rawPrice =
          populatedProduct.purchasePrice ??
          populatedProduct?.toObject?.().purchasePrice;
        if (typeof rawPrice === 'number') {
          return rawPrice;
        }
      }

      const productId =
        typeof populatedProduct === 'string'
          ? populatedProduct
          : populatedProduct?._id?.toString?.() ??
            item?.product?.toString?.() ??
            '';

      if (!productId) {
        return 0;
      }

      if (productCostCache.has(productId)) {
        return productCostCache.get(productId) as number;
      }

      try {
        const product = await this.productService.findOne(productId);
        const price = product?.purchasePrice ?? 0;
        productCostCache.set(productId, price);
        return price;
      } catch (error) {
        this.logger.warn(
          `Unable to resolve purchase price for product ${productId}: ${error.message}`,
        );
        productCostCache.set(productId, 0);
        return 0;
      }
    };

    for (const order of orders) {
      totalRevenue += order.total || 0;

      for (const item of order.items) {
        const purchasePrice = await resolvePurchasePrice(item);
        totalCost += purchasePrice * item.quantity;
      }
    }

    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      totalCost,
    };
  }

  async getTopProducts(limit: number = 10): Promise<any[]> {
    return this.orderModel.aggregate([
      { $match: { status: OrderStatus.COMPLETED } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          productName: { $first: '$items.productName' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.subtotal' },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: limit },
    ]);
  }

  async remove(id: string): Promise<void> {
    const result = await this.orderModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException('Order not found');
    }

    this.logger.log(`Order deleted: ${result.orderNumber}`);
  }
}

