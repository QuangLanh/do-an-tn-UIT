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
import { TaoDonHangKhachDto } from './dto/tao-don-hang-khach.dto';
import { CapNhatTrangThaiDonHangDto } from './dto/cap-nhat-trang-thai-don-hang.dto';
import { DichVuSanPham } from '../san-pham/san-pham.dich-vu';
import { DichVuKhachHang } from '../khach-hang/khach-hang.dich-vu';
import { TrangThaiDonHang } from '../../dung-chung/liet-ke/trang-thai-don-hang.enum';
import { ThaoTacTonKho } from '../san-pham/dto/cap-nhat-ton-kho.dto';

@Injectable()
export class DichVuDonHang {
  private readonly logger = new Logger(DichVuDonHang.name);

  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private dichVuSanPham: DichVuSanPham,
    private dichVuKhachHang: DichVuKhachHang,
  ) {}

  // --- HÀM HỖ TRỢ: TỰ ĐỘNG ĐIỀN GIÁ VỐN CHO ĐƠN CŨ ---
  private async enrichOrdersWithCost(orders: any[]): Promise<any[]> {
    if (!orders || orders.length === 0) return [];

    // 1. Lấy danh sách ID sản phẩm cần tra cứu
    const productIds = new Set<string>();
    orders.forEach(o => o.items.forEach((i: any) => {
        if (i.product) {
             const pId = i.product._id ? i.product._id.toString() : i.product.toString();
             productIds.add(pId);
        }
    }));

    // 2. Lấy giá vốn hiện tại từ bảng Product
    const productCostMap = new Map<string, number>();
    try {
        // Dùng 'any' để tránh lỗi TS nếu productModel không public
        const productModel = (this.dichVuSanPham as any).productModel;
        if (productModel) {
            const products = await productModel.find({
                _id: { $in: Array.from(productIds) }
            }).select('_id importPrice purchasePrice').lean().exec();

            products.forEach((p: any) => {
                const cost = p.purchasePrice || p.importPrice || 0;
                productCostMap.set(p._id.toString(), cost);
            });
        }
    } catch (e) {
        this.logger.warn('Không thể tra cứu giá vốn bổ sung');
    }

    // 3. Điền giá vốn vào các item bị thiếu
    // Phải convert sang Object thường để sửa đổi được (nếu là Mongoose Doc)
    const enrichedOrders = orders.map(order => {
        const orderObj = order.toObject ? order.toObject() : order;

        if (orderObj.items) {
            orderObj.items = orderObj.items.map((item: any) => {
                // Nếu đã có giá vốn > 0 thì giữ nguyên
                if (item.importPrice && item.importPrice > 0) return item;

                // Nếu chưa có, lấy từ Map
                const pId = item.product && (item.product._id || item.product).toString();
                const fallbackCost = productCostMap.get(pId) || 0;

                return {
                    ...item,
                    importPrice: fallbackCost // Bù giá vốn vào đây
                };
            });
        }
        return orderObj;
    });

    return enrichedOrders;
  }
  // ----------------------------------------------------

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
    const orderItems = [];
    let subtotal = 0;

    for (const item of createOrderDto.items) {
      const product = await this.dichVuSanPham.findOne(item.productId);
      if (!product.isActive) throw new BadRequestException(`Product ${product.name} inactive`);
      if (product.stock < item.quantity) throw new BadRequestException(`Insufficient stock`);

      const itemSubtotal = product.salePrice * item.quantity;
      subtotal += itemSubtotal;
      const giaVon = product['importPrice'] || product['purchasePrice'] || 0;

      orderItems.push({
        product: new Types.ObjectId(item.productId),
        productName: product.name,
        quantity: item.quantity,
        price: product.salePrice,
        subtotal: itemSubtotal,
        importPrice: giaVon,
      });
    }

    const tax = createOrderDto.tax || 0;
    const discount = createOrderDto.discount || 0;
    const total = subtotal + tax - discount;
    const orderNumber = await this.generateOrderNumber();

    const order = new this.orderModel({
      orderNumber,
      orderType: 'SALE',
      items: orderItems,
      subtotal,
      tax,
      discount,
      total,
      customerName: createOrderDto.customerName,
      customerPhone: createOrderDto.customerPhone,
      notes: createOrderDto.notes,
      paymentMethod: createOrderDto.paymentMethod,
      paymentStatus: createOrderDto.isDebt ? 'DEBT' : 'PAID',
      paidAt: createOrderDto.isDebt ? undefined : new Date(),
      wasDebt: createOrderDto.isDebt,
      createdBy: new Types.ObjectId(userId),
      status: TrangThaiDonHang.COMPLETED,
      isOnline: false, // Đơn hàng tạo từ admin/staff là offline
    });

    const savedOrder = await order.save();

    // Tự động tạo/cập nhật khách hàng nếu có số điện thoại
    if (createOrderDto.customerPhone) {
      try {
        await this.dichVuKhachHang.taoNeuChuaCo(
          createOrderDto.customerPhone,
          createOrderDto.customerName,
        );
      } catch (error) {
        this.logger.warn(`Không thể tạo/cập nhật khách hàng: ${error.message}`);
      }
    }

    for (const item of createOrderDto.items) {
      await this.dichVuSanPham.updateStock(item.productId, {
        operation: ThaoTacTonKho.SUBTRACT,
        quantity: item.quantity,
      });
    }
    return savedOrder;
  }

  // === ĐÂY LÀ HÀM QUAN TRỌNG NHẤT ĐƯỢC SỬA ===
  async findAll(query?: any): Promise<Order[]> {
    const filter: any = {};
    if (query?.status) filter.status = query.status;
    if (query?.isOnline !== undefined) {
      const isOnlineFilter = query.isOnline === 'true' || query.isOnline === true;
      if (isOnlineFilter) {
        // Đơn hàng online: có isOnline = true HOẶC (có customerAddress và không có createdBy)
        // Đơn hàng từ customer app luôn có customerAddress và không có createdBy
        const onlineCond1: any = { isOnline: true };
        const onlineCond2: any = {
          customerAddress: { $exists: true, $nin: [null, ''] }
        };
        const createdByCond: any[] = [
          { createdBy: { $exists: false } },
          { createdBy: null }
        ];
        onlineCond2.$or = createdByCond;
        const onlineCond3: any = {
          $and: [
            { customerAddress: { $exists: true, $nin: [null, ''] } },
            { $or: createdByCond }
          ]
        };
        filter.$or = [onlineCond1, onlineCond3];
      } else {
        // Đơn hàng offline: có isOnline = false và có createdBy (từ admin/staff)
        const offlineCondition1: any = {
          isOnline: false,
          createdBy: { $exists: true, $ne: null }
        };
        const addressConditions: any[] = [
          { customerAddress: { $exists: false } },
          { customerAddress: null },
          { customerAddress: '' }
        ];
        const offlineCondition2: any = {
          $and: [
            { $or: addressConditions },
            { createdBy: { $exists: true, $ne: null } }
          ]
        };
        filter.$or = [offlineCondition1, offlineCondition2];
      }
    }
    if (query?.from || query?.to) {
      filter.createdAt = {};
      if (query.from) filter.createdAt.$gte = new Date(query.from);
      if (query.to) filter.createdAt.$lte = new Date(query.to);
    }

    const orders = await this.orderModel
      .find(filter)
      .populate('createdBy', 'fullName email')
      .populate('items.product')
      .sort({ createdAt: -1 })
      .exec();

    // Tự động điền giá vốn cho các đơn hàng cũ trước khi trả về Frontend
    return this.enrichOrdersWithCost(orders);
  }
  // ============================================

  async layLichSuMuaHangTheoSoDienThoai(soDienThoai: string): Promise<Order[]> {
    const orders = await this.orderModel
      .find({ customerPhone: soDienThoai, status: TrangThaiDonHang.COMPLETED })
      .populate('items.product')
      .sort({ createdAt: -1 })
      .exec();

    return this.enrichOrdersWithCost(orders);
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderModel
      .findById(id)
      .populate('createdBy', 'fullName email')
      .populate('items.product')
      .exec();

    if (!order) throw new NotFoundException('Order not found');

    // Enrich cost cho đơn lẻ luôn
    const enriched = await this.enrichOrdersWithCost([order]);
    return enriched[0];
  }

  // ... (Giữ nguyên các hàm updateStatus, payDebt, remove, v.v.)
  async updateStatus(id: string, dto: CapNhatTrangThaiDonHangDto): Promise<Order> {
    const updateData: any = { status: dto.status };
    
    // Nếu status là completed, tự động set payment status thành PAID
    if (dto.status === TrangThaiDonHang.COMPLETED) {
      updateData.paymentStatus = 'PAID';
      updateData.paidAt = new Date();
    } else {
      // Các trạng thái khác: set payment status thành DEBT (chưa thanh toán)
      // Chỉ set nếu chưa phải REFUNDED (giữ nguyên REFUNDED)
      const order = await this.orderModel.findById(id).exec();
      if (order && order.paymentStatus !== 'REFUNDED') {
        updateData.paymentStatus = 'DEBT';
      }
    }
    
    return this.orderModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async payDebt(id: string): Promise<Order> {
    const order = await this.orderModel.findById(id).exec();
    if (!order) throw new NotFoundException('Order not found');
    order.paymentStatus = 'PAID';
    order.paidAt = new Date();
    return order.save();
  }

  async updatePaymentStatus(id: string, paymentStatus: string): Promise<Order> {
    const order = await this.orderModel.findById(id).exec();
    if (!order) throw new NotFoundException('Order not found');
    order.paymentStatus = paymentStatus as 'PAID' | 'DEBT' | 'REFUNDED';
    if (paymentStatus === 'PAID' && !order.paidAt) {
      order.paidAt = new Date();
    }
    return order.save();
  }

  async findDebts(): Promise<Order[]> {
    return this.orderModel.find({ paymentStatus: 'DEBT' }).populate('items.product').exec();
  }

  // Hàm này để hỗ trợ dashboard backend (nếu dùng)
  async getDebtStatistics(): Promise<any> {
    const debtOrders = await this.orderModel.find({ paymentStatus: 'DEBT' }).exec();
    return {
      totalDebtOrders: debtOrders.length,
      totalDebtAmount: debtOrders.reduce((sum, o) => sum + (o.total || 0), 0),
    };
  }

  async getStatistics(from?: Date, to?: Date): Promise<any> {
    // Hàm này giữ nguyên logic "fix" cũ để đảm bảo API /summary cũng đúng
    // (Dù frontend không dùng nhưng để đó cho chắc)
    const orders = await this.findAll({ from, to, status: TrangThaiDonHang.COMPLETED });

    let totalRevenue = 0, totalCost = 0, totalOrders = 0, totalReturns = 0;

    for (const order of orders) {
      if(order.paymentStatus !== 'PAID' && order.paymentStatus !== 'REFUNDED') continue;

      totalRevenue += order.total || 0;
      if (order.orderType === 'RETURN') totalReturns++;
      else totalOrders++;

      if (order.items) {
        for (const item of order.items) {
           // Lúc này item.importPrice đã được hàm findAll enrich rồi!
           const itemCost = item.importPrice || 0;
           if (order.orderType === 'RETURN' && order.isRestocked) totalCost -= itemCost * item.quantity;
           else if (order.orderType !== 'RETURN') totalCost += itemCost * item.quantity;
        }
      }
    }
    return {
       totalRevenue, totalCost, totalOrders, totalReturns,
       grossProfit: totalRevenue - totalCost,
       averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
    };
  }

  async getTopProducts(limit: number = 10): Promise<any[]> {
    // Top products dùng aggregate, khó enrich -> Dùng logic cũ của MongoDB
    // Hoặc chấp nhận top products lãi ảo với đơn cũ.
    // Để fix triệt để, nên dùng map-reduce trên code, nhưng tạm thời giữ nguyên.
    return this.orderModel.aggregate([
      { $match: { status: TrangThaiDonHang.COMPLETED, paymentStatus: 'PAID' } },
      { $unwind: '$items' },
      { $group: {
          _id: '$items.product',
          productName: { $first: '$items.productName' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.subtotal' },
      }},
      { $sort: { totalQuantity: -1 } },
      { $limit: limit },
    ]);
  }

  // ... (Giữ nguyên phần Đổi Trả hàng createReturn, createExchange)
  // Nhớ copy lại các hàm helper generate, findByOrderNumber từ file cũ của bạn
  // Vì giới hạn ký tự, tôi chỉ viết khung logic chính ở trên.

  private async generateExchangeNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const count = await this.orderModel.countDocuments({ orderType: 'EXCHANGE' });
    const num = (count + 1).toString().padStart(4, '0');
    return `EXC${year}${month}${day}${num}`;
  }

  private async generateReturnNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const count = await this.orderModel.countDocuments({ orderType: 'RETURN' });
    const num = (count + 1).toString().padStart(4, '0');
    return `RET${year}${month}${day}${num}`;
  }

  async findByOrderNumber(orderNumber: string): Promise<Order> {
    const order = await this.orderModel.findOne({ orderNumber }).populate('items.product').exec();
    if (!order) throw new NotFoundException(`Không tìm thấy đơn hàng ${orderNumber}`);
    return order;
  }

  async findByPhone(phone: string): Promise<Order[]> { return this.findAll(); /* Tạm */ }

  async createExchange(dto: any, uid: string): Promise<Order> {
    const originalOrder = await this.findByOrderNumber(dto.originalOrderCode);
    const orderItems: any[] = [];
    let total = 0;

    for (const returnItem of dto.returnItems) {
      const orderItem = originalOrder.items.find((item) => {
        const pId = (item.product as any)?._id ? (item.product as any)._id.toString() : String(item.product);
        return pId === returnItem.productId;
      });
      if (!orderItem) throw new BadRequestException(`Sản phẩm không thuộc đơn ${dto.originalOrderCode}`);
      const product = await this.dichVuSanPham.findOne(returnItem.productId);
      const giaVon = product['importPrice'] ?? product['purchasePrice'] ?? 0;
      const itemSubtotal = orderItem.price * returnItem.quantity;
      orderItems.push({
        product: new Types.ObjectId(returnItem.productId),
        productName: orderItem.productName,
        quantity: returnItem.quantity,
        price: orderItem.price,
        subtotal: -itemSubtotal,
        importPrice: giaVon,
      });
      total -= itemSubtotal;
      await this.dichVuSanPham.updateStock(returnItem.productId, {
        operation: ThaoTacTonKho.ADD,
        quantity: returnItem.quantity,
      });
    }

    for (const exchangeItem of dto.exchangeItems) {
      const product = await this.dichVuSanPham.findOne(exchangeItem.productId);
      if (!product?.isActive) throw new BadRequestException(`Sản phẩm không còn bán`);
      if (product.stock < exchangeItem.quantity) {
        throw new BadRequestException(`Sản phẩm ${product.name} không đủ số lượng. Còn: ${product.stock}`);
      }
      const price = product.salePrice ?? product['salePrice'] ?? 0;
      const giaVon = product['importPrice'] ?? product['purchasePrice'] ?? 0;
      const itemSubtotal = price * exchangeItem.quantity;
      orderItems.push({
        product: new Types.ObjectId(exchangeItem.productId),
        productName: product.name,
        quantity: exchangeItem.quantity,
        price,
        subtotal: itemSubtotal,
        importPrice: giaVon,
      });
      total += itemSubtotal;
      await this.dichVuSanPham.updateStock(exchangeItem.productId, {
        operation: ThaoTacTonKho.SUBTRACT,
        quantity: exchangeItem.quantity,
      });
    }

    const orderNumber = await this.generateExchangeNumber();
    const order = new this.orderModel({
      orderNumber,
      orderType: 'EXCHANGE',
      relatedOrderCode: originalOrder.orderNumber,
      items: orderItems,
      subtotal: total,
      tax: 0,
      discount: 0,
      total,
      customerName: originalOrder.customerName,
      customerPhone: originalOrder.customerPhone,
      paymentStatus: total >= 0 ? 'PAID' : 'REFUNDED',
      paidAt: new Date(),
      status: TrangThaiDonHang.COMPLETED,
      createdBy: new Types.ObjectId(uid),
      isOnline: false,
    });
    return order.save();
  }

  async createReturn(returnDto: any, userId: string): Promise<Order> {
    const originalOrder = await this.findByOrderNumber(returnDto.originalOrderCode);
    const returnItems = [];
    let subtotal = 0;

    for (const returnItem of returnDto.returnItems) {
      const orderItem = originalOrder.items.find((item) => {
        const pId = (item.product as any)._id ? (item.product as any)._id.toString() : item.product.toString();
        return pId === returnItem.productId;
      });
      if (!orderItem) throw new BadRequestException('Item not found');

      const product = await this.dichVuSanPham.findOne(returnItem.productId);
      const itemSubtotal = orderItem.price * returnItem.quantity;
      subtotal += itemSubtotal;

      // Lấy giá vốn hiện tại
      const giaVon = product['importPrice'] || product['purchasePrice'] || 0;

      returnItems.push({
        product: new Types.ObjectId(returnItem.productId),
        productName: orderItem.productName,
        quantity: returnItem.quantity,
        price: orderItem.price,
        subtotal: itemSubtotal,
        importPrice: giaVon,
      });

      if (returnDto.isRestocked) {
        await this.dichVuSanPham.updateStock(returnItem.productId, {
          operation: ThaoTacTonKho.ADD, quantity: returnItem.quantity,
        });
      }
    }

    return new this.orderModel({
      orderNumber: await this.generateReturnNumber(),
      orderType: 'RETURN',
      relatedOrderCode: originalOrder.orderNumber,
      items: returnItems,
      subtotal: -subtotal,
      total: -subtotal,
      customerName: originalOrder.customerName,
      customerPhone: originalOrder.customerPhone,
      returnReason: returnDto.returnReason,
      isRestocked: returnDto.isRestocked,
      paymentStatus: 'REFUNDED',
      paidAt: new Date(),
      status: TrangThaiDonHang.COMPLETED,
    }).save();
  }

  async findExchanges(): Promise<Order[]> {
    return this.orderModel
      .find({ orderType: 'EXCHANGE' })
      .populate('items.product')
      .sort({ createdAt: -1 })
      .exec();
  }
  async remove(id: string): Promise<void> { await this.orderModel.findByIdAndDelete(id); }

  async findReturns(): Promise<Order[]> {
    return this.orderModel
      .find({ orderType: 'RETURN' })
      .populate('createdBy', 'fullName email')
      .populate('items.product')
      .sort({ createdAt: -1 })
      .exec();
  }

  // ==================== CUSTOMER ORDER METHODS ====================

  /**
   * Tạo đơn hàng từ khách (không cần đăng nhập)
   */
  async taoDonHangKhach(dto: TaoDonHangKhachDto): Promise<Order> {
    // Validate items
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Đơn hàng phải có ít nhất 1 sản phẩm');
    }

    // Validate and prepare order items
    const orderItems = [];
    let subtotal = 0;

    for (const item of dto.items) {
      // Verify product exists and has enough stock
      const product = await this.dichVuSanPham.findOne(item.productId);

      if (!product.isActive) {
        throw new BadRequestException(`Sản phẩm ${product.name} không còn bán`);
      }

      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Sản phẩm ${product.name} không đủ số lượng. Còn lại: ${product.stock}`,
        );
      }

      const itemSubtotal = item.price * item.quantity;
      subtotal += itemSubtotal;

      const giaVon = product['importPrice'] || product['purchasePrice'] || 0;

      orderItems.push({
        product: new Types.ObjectId(item.productId),
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        subtotal: itemSubtotal,
        importPrice: giaVon,
      });

      // Update stock
      await this.dichVuSanPham.updateStock(item.productId, {
        operation: ThaoTacTonKho.SUBTRACT,
        quantity: item.quantity,
      });
    }

    // Calculate total
    const total = subtotal;

    // Generate order number
    const orderNumber = await this.generateOrderNumber();

    // Tự động tạo/cập nhật khách hàng trước khi tạo đơn hàng
    if (dto.customerInfo.phone) {
      try {
        await this.dichVuKhachHang.taoNeuChuaCo(
          dto.customerInfo.phone,
          dto.customerInfo.name,
        );
        // Cập nhật thêm email và địa chỉ nếu có
        const khachHang = await this.dichVuKhachHang.timTheoSoDienThoai(dto.customerInfo.phone);
        if (khachHang && (dto.customerInfo.email || dto.customerInfo.address)) {
          await this.dichVuKhachHang.capNhat(khachHang._id.toString(), {
            email: dto.customerInfo.email,
            diaChi: dto.customerInfo.address,
          });
        }
      } catch (error) {
        this.logger.warn(`Không thể tạo/cập nhật khách hàng: ${error.message}`);
      }
    }

    // Create customer order
    const order = new this.orderModel({
      orderNumber,
      orderType: 'SALE',
      items: orderItems,
      subtotal,
      tax: 0,
      discount: 0,
      total,
      customerName: dto.customerInfo.name,
      customerPhone: dto.customerInfo.phone,
      customerAddress: dto.customerInfo.address,
      customerEmail: dto.customerInfo.email,
      notes: dto.notes,
      paymentMethod: dto.paymentMethod || 'cash',
      paymentStatus: 'DEBT', // Default to unpaid for customer orders
      status: TrangThaiDonHang.PENDING, // Start with pending status
      isOnline: true, // Đơn hàng từ customer app là online
    });

    const savedOrder = await order.save();
    this.logger.log(`Customer order created: ${savedOrder.orderNumber}`);

    return savedOrder;
  }

  /**
   * Lấy danh sách đơn hàng theo số điện thoại
   */
  async layDonHangTheoSoDienThoai(phone: string): Promise<Order[]> {
    return this.orderModel
      .find({ customerPhone: phone })
      .populate('items.product')
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Hủy đơn hàng (khách hàng)
   */
  async huyDonHangKhach(id: string, reason?: string): Promise<Order> {
    const order = await this.findOne(id);

    // Only allow cancellation if order is in pending or confirmed status
    if (![TrangThaiDonHang.PENDING, TrangThaiDonHang.CONFIRMED].includes(order.status)) {
      throw new BadRequestException(
        'Chỉ có thể hủy đơn hàng ở trạng thái chờ xử lý hoặc đã xác nhận',
      );
    }

    // Restore stock
    for (const item of order.items) {
      await this.dichVuSanPham.updateStock(item.product.toString(), {
        operation: ThaoTacTonKho.ADD,
        quantity: item.quantity,
      });
    }

    // Update order status using findByIdAndUpdate
    const updateData: any = {
      status: TrangThaiDonHang.CANCELLED,
    };

    if (reason) {
      updateData.notes = `${order.notes || ''}\nLý do hủy: ${reason}`;
    }

    const updatedOrder = await this.orderModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('createdBy', 'fullName email')
      .populate('items.product')
      .exec();

    if (!updatedOrder) {
      throw new NotFoundException('Order not found');
    }

    this.logger.log(`Customer order cancelled: ${updatedOrder.orderNumber}`);

    return updatedOrder;
  }
}