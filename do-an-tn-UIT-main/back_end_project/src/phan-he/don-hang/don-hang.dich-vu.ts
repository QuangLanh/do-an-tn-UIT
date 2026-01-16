import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { TaoDonHangDto } from './dto/tao-don-hang.dto';
import { CapNhatTrangThaiDonHangDto } from './dto/cap-nhat-trang-thai-don-hang.dto';
import { DichVuSanPham } from '../san-pham/san-pham.dich-vu';
import { TrangThaiDonHang } from '../../dung-chung/liet-ke/trang-thai-don-hang.enum';
import { ThaoTacTonKho } from '../san-pham/dto/cap-nhat-ton-kho.dto';

@Injectable()
export class DichVuDonHang {
  private readonly logger = new Logger(DichVuDonHang.name);

  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private dichVuSanPham: DichVuSanPham,
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

async create(createOrderDto: TaoDonHangDto, userId: string): Promise<Order> {
    // Validate and calculate order items
    const orderItems = [];
    let subtotal = 0;

    for (const item of createOrderDto.items) {
      const product = await this.dichVuSanPham.findOne(item.productId);

      if (!product.isActive) {
        throw new BadRequestException(`Product ${product.name} is not active`);
      }

      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for ${product.name}. Available: ${product.stock}`,
        );
      }

      const itemSubtotal = product.salePrice * item.quantity; // Hoặc product.price tùy model của bạn
      subtotal += itemSubtotal;

      // --- ĐOẠN CẦN SỬA Ở ĐÂY ---
      // Kiểm tra xem trong Model Product của bạn tên biến là 'importPrice' hay 'purchasePrice'
      // Để an toàn, mình sẽ lấy cả 2, cái nào có dữ liệu thì dùng.
      const giaVon = product['importPrice'] || product['purchasePrice'] || 0;

      orderItems.push({
        product: new Types.ObjectId(item.productId),
        productName: product.name,
        quantity: item.quantity,
        price: product.salePrice, // Giá bán
        subtotal: itemSubtotal,
        importPrice: giaVon // <--- QUAN TRỌNG: Phải lưu giá vốn vào đây!
      });
      // --------------------------
    }

    // Calculate total
    const tax = createOrderDto.tax || 0;
    const discount = createOrderDto.discount || 0;
    const total = subtotal + tax - discount;

    // Generate order number
    const orderNumber = await this.generateOrderNumber();

    // Xử lý logic ghi nợ
    const paymentStatus = createOrderDto.isDebt ? 'DEBT' : 'PAID';
    const paidAt = createOrderDto.isDebt ? undefined : new Date();
    const wasDebt = createOrderDto.isDebt ? true : false;

    // Create order
    const order = new this.orderModel({
      orderNumber,
      orderType: 'SALE', // Đơn bán hàng thường
      items: orderItems,
      subtotal,
      tax,
      discount,
      total,
      customerName: createOrderDto.customerName,
      customerPhone: createOrderDto.customerPhone,
      notes: createOrderDto.notes,
      paymentMethod: createOrderDto.paymentMethod,
      paymentStatus,
      paidAt,
      wasDebt,
      createdBy: new Types.ObjectId(userId),
      status: TrangThaiDonHang.COMPLETED,
    });

    const savedOrder = await order.save();

    // Update product stock
    for (const item of createOrderDto.items) {
      await this.dichVuSanPham.updateStock(item.productId, {
        operation: ThaoTacTonKho.SUBTRACT,
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

  /**
   * Lịch sử mua hàng cho khách (READ-ONLY)
   * - Dựa trên số điện thoại khách hàng đã được lưu trong Order (customerPhone)
   * - Đơn hàng do nhân viên tạo và đã hoàn tất tại cửa hàng
   */
  async layLichSuMuaHangTheoSoDienThoai(soDienThoai: string): Promise<Order[]> {
    return this.orderModel
      .find({
        customerPhone: soDienThoai,
        status: TrangThaiDonHang.COMPLETED,
      })
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
    updateOrderStatusDto: CapNhatTrangThaiDonHangDto,
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

  async payDebt(id: string): Promise<Order> {
    const order = await this.orderModel.findById(id).exec();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.paymentStatus !== 'DEBT') {
      throw new BadRequestException('Order is not in debt status');
    }

    order.paymentStatus = 'PAID';
    order.paidAt = new Date();

    const updatedOrder = await order.save();

    this.logger.log(`Order ${updatedOrder.orderNumber} debt paid`);
    return updatedOrder;
  }

  async findDebts(): Promise<Order[]> {
    return this.orderModel
      .find({ paymentStatus: 'DEBT' })
      .populate('createdBy', 'fullName email')
      .populate('items.product')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getStatistics(from?: Date, to?: Date): Promise<any> {
    const filter: any = {
      status: TrangThaiDonHang.COMPLETED,
      paymentStatus: 'PAID', // Chỉ tính đơn hàng đã thanh toán
    };

    if (from || to) {
      filter.paidAt = {}; // Dùng paidAt thay vì createdAt để tính doanh thu
      if (from) filter.paidAt.$gte = from;
      if (to) filter.paidAt.$lte = to;
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
        const product = await this.dichVuSanPham.findOne(productId);
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

  async getDebtStatistics(): Promise<any> {
    const debtOrders = await this.orderModel
      .find({ paymentStatus: 'DEBT' })
      .exec();

    const totalDebtOrders = debtOrders.length;
    const totalDebtAmount = debtOrders.reduce(
      (sum, order) => sum + (order.total || 0),
      0,
    );

    return {
      totalDebtOrders,
      totalDebtAmount,
    };
  }

  async getTopProducts(limit: number = 10): Promise<any[]> {
    return this.orderModel.aggregate([
      { 
        $match: { 
          status: TrangThaiDonHang.COMPLETED,
          paymentStatus: 'PAID' // Chỉ tính sản phẩm đã thanh toán
        } 
      },
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

  // ============ ĐỔI/TRẢ HÀNG ============

  private async generateExchangeNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    const count = await this.orderModel.countDocuments({ orderType: 'EXCHANGE' });
    const orderNum = (count + 1).toString().padStart(4, '0');

    return `EX${year}${month}${day}${orderNum}`;
  }

  private async generateReturnNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    const count = await this.orderModel.countDocuments({ orderType: 'RETURN' });
    const orderNum = (count + 1).toString().padStart(4, '0');

    return `RF${year}${month}${day}${orderNum}`;
  }

  async findByOrderNumber(orderNumber: string): Promise<Order> {
    const order = await this.orderModel
      .findOne({ orderNumber })
      .populate('createdBy', 'fullName email')
      .populate('items.product')
      .exec();

    if (!order) {
      throw new NotFoundException(`Order ${orderNumber} not found`);
    }

    return order;
  }

  async findByPhone(phone: string): Promise<Order[]> {
    return this.orderModel
      .find({ 
        customerPhone: phone,
        status: TrangThaiDonHang.COMPLETED 
      })
      .populate('items.product')
      .sort({ createdAt: -1 })
      .exec();
  }

  async createExchange(exchangeDto: any, userId: string): Promise<Order> {
    // Tìm đơn hàng gốc
    const originalOrder = await this.findByOrderNumber(exchangeDto.originalOrderCode);

    // Validate sản phẩm trả (phải có trong đơn gốc)
    for (const returnItem of exchangeDto.returnItems) {
      const orderItem = originalOrder.items.find(
        (item) => item.product.toString() === returnItem.productId
      );
      if (!orderItem) {
        throw new BadRequestException(
          `Product ${returnItem.productId} not found in original order`
        );
      }
      if (orderItem.quantity < returnItem.quantity) {
        throw new BadRequestException(
          `Cannot return more than purchased quantity`
        );
      }
    }

    // Hoàn kho sản phẩm cũ (trả lại)
    for (const returnItem of exchangeDto.returnItems) {
      await this.dichVuSanPham.updateStock(returnItem.productId, {
        operation: ThaoTacTonKho.ADD,
        quantity: returnItem.quantity,
      });
    }

    // Validate và trừ kho sản phẩm mới
    const exchangeItems = [];
    let subtotal = 0;

    for (const item of exchangeDto.exchangeItems) {
      const product = await this.dichVuSanPham.findOne(item.productId);

      if (!product.isActive) {
        throw new BadRequestException(`Product ${product.name} is not active`);
      }

      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for ${product.name}. Available: ${product.stock}`
        );
      }

      const itemSubtotal = product.salePrice * item.quantity;
      subtotal += itemSubtotal;

      const giaVon = product['importPrice'] || product['purchasePrice'] || 0;

      exchangeItems.push({
        product: new Types.ObjectId(item.productId),
        productName: product.name,
        quantity: item.quantity,
        price: product.salePrice,
        subtotal: itemSubtotal,
        importPrice: giaVon,
      });

      // Trừ kho sản phẩm mới
      await this.dichVuSanPham.updateStock(item.productId, {
        operation: ThaoTacTonKho.SUBTRACT,
        quantity: item.quantity,
      });
    }

    // Tính chênh lệch (nếu có)
    const total = subtotal; // Có thể tính chênh lệch phức tạp hơn

    // Tạo đơn đổi hàng
    const exchangeNumber = await this.generateExchangeNumber();

    const exchangeOrder = new this.orderModel({
      orderNumber: exchangeNumber,
      orderType: 'EXCHANGE',
      relatedOrderCode: originalOrder.orderNumber,
      items: exchangeItems,
      subtotal,
      tax: 0,
      discount: 0,
      total,
      customerName: originalOrder.customerName,
      customerPhone: originalOrder.customerPhone,
      notes: `Đổi hàng từ đơn ${originalOrder.orderNumber}`,
      paymentStatus: 'PAID',
      paidAt: new Date(),
      createdBy: new Types.ObjectId(userId),
      status: TrangThaiDonHang.COMPLETED,
    });

    const savedOrder = await exchangeOrder.save();
    this.logger.log(`Exchange order created: ${savedOrder.orderNumber}`);

    return savedOrder;
  }

  async createReturn(returnDto: any, userId: string): Promise<Order> {
    // Tìm đơn hàng gốc
    const originalOrder = await this.findByOrderNumber(returnDto.originalOrderCode);

    // Validate sản phẩm trả
    for (const returnItem of returnDto.returnItems) {
      const orderItem = originalOrder.items.find(
        (item) => item.product.toString() === returnItem.productId
      );
      if (!orderItem) {
        throw new BadRequestException(
          `Product ${returnItem.productId} not found in original order`
        );
      }
      if (orderItem.quantity < returnItem.quantity) {
        throw new BadRequestException(
          `Cannot return more than purchased quantity`
        );
      }
    }

    // Hoàn kho và tính tiền hoàn trả
    const returnItems = [];
    let subtotal = 0;

    for (const returnItem of returnDto.returnItems) {
      const orderItem = originalOrder.items.find(
        (item) => item.product.toString() === returnItem.productId
      );

      const product = await this.dichVuSanPham.findOne(returnItem.productId);
      
      const itemSubtotal = orderItem.price * returnItem.quantity;
      subtotal += itemSubtotal;

      const giaVon = product['importPrice'] || product['purchasePrice'] || 0;

      returnItems.push({
        product: new Types.ObjectId(returnItem.productId),
        productName: orderItem.productName,
        quantity: returnItem.quantity,
        price: orderItem.price,
        subtotal: itemSubtotal,
        importPrice: giaVon,
      });

      // Hoàn kho
      await this.dichVuSanPham.updateStock(returnItem.productId, {
        operation: ThaoTacTonKho.ADD,
        quantity: returnItem.quantity,
      });
    }

    const total = -subtotal; // Số âm để đại diện cho tiền hoàn trả

    // Tạo đơn trả hàng
    const returnNumber = await this.generateReturnNumber();

    const returnOrder = new this.orderModel({
      orderNumber: returnNumber,
      orderType: 'RETURN',
      relatedOrderCode: originalOrder.orderNumber,
      items: returnItems,
      subtotal: -subtotal,
      tax: 0,
      discount: 0,
      total,
      customerName: originalOrder.customerName,
      customerPhone: originalOrder.customerPhone,
      notes: `Trả hàng từ đơn ${originalOrder.orderNumber}`,
      paymentStatus: 'PAID',
      paidAt: new Date(),
      createdBy: new Types.ObjectId(userId),
      status: TrangThaiDonHang.COMPLETED,
    });

    const savedOrder = await returnOrder.save();
    this.logger.log(`Return order created: ${savedOrder.orderNumber}`);

    return savedOrder;
  }

  async findExchanges(): Promise<Order[]> {
    return this.orderModel
      .find({ orderType: 'EXCHANGE' })
      .populate('createdBy', 'fullName email')
      .populate('items.product')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findReturns(): Promise<Order[]> {
    return this.orderModel
      .find({ orderType: 'RETURN' })
      .populate('createdBy', 'fullName email')
      .populate('items.product')
      .sort({ createdAt: -1 })
      .exec();
  }
}

