import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { KhachHang, KhachHangDocument, LoaiKhachHang } from './schemas/khach-hang.schema';
import { Order, OrderDocument } from '../don-hang/schemas/order.schema';

@Injectable()
export class DichVuKhachHang {
  private readonly logger = new Logger(DichVuKhachHang.name);

  constructor(
    @InjectModel(KhachHang.name)
    private khachHangModel: Model<KhachHangDocument>,
    @InjectModel(Order.name)
    private orderModel: Model<OrderDocument>,
  ) {}

  async findAll(): Promise<KhachHang[]> {
    return this.khachHangModel.find().sort({ createdAt: -1 }).exec();
  }

  async timTheoId(id: string) {
    return this.khachHangModel.findById(id).exec();
  }

  async timTheoSoDienThoai(soDienThoai: string) {
    return this.khachHangModel.findOne({ soDienThoai }).exec();
  }

  async taoNeuChuaCo(soDienThoai: string, ten?: string) {
    const daCo = await this.timTheoSoDienThoai(soDienThoai);
    if (daCo) {
      // Nếu user cập nhật tên ở lần đăng nhập sau
      if (ten && ten !== daCo.ten) {
        daCo.ten = ten;
        await daCo.save();
      }
      return daCo;
    }

    const khachHang = new this.khachHangModel({
      soDienThoai,
      ten,
    });

    return khachHang.save();
  }

  async tao(data: { soDienThoai: string; ten?: string; email?: string; diaChi?: string; isActive?: boolean }): Promise<KhachHang> {
    // Kiểm tra số điện thoại đã tồn tại chưa
    const existing = await this.timTheoSoDienThoai(data.soDienThoai);
    if (existing) {
      throw new ConflictException('Số điện thoại đã được sử dụng');
    }

    const khachHang = new this.khachHangModel({
      soDienThoai: data.soDienThoai,
      ten: data.ten,
      email: data.email,
      diaChi: data.diaChi,
      isActive: data.isActive !== undefined ? data.isActive : true,
    });

    return khachHang.save();
  }

  async capNhat(
    id: string,
    data: { ten?: string; soDienThoai?: string; email?: string; diaChi?: string; isActive?: boolean },
  ) {
    const existing = await this.khachHangModel.findById(id).exec();
    if (!existing) {
      throw new NotFoundException('Customer not found');
    }

    if (data.soDienThoai && data.soDienThoai !== existing.soDienThoai) {
      const duplicate = await this.khachHangModel.findOne({ soDienThoai: data.soDienThoai }).exec();
      if (duplicate) {
        throw new ConflictException('Số điện thoại đã được sử dụng');
      }
    }

    const khachHang = await this.khachHangModel
      .findByIdAndUpdate(id, { $set: data }, { new: true })
      .exec();

    if (!khachHang) {
      throw new NotFoundException('Customer not found');
    }

    return khachHang;
  }

  /**
   * Đồng bộ khách hàng từ tất cả đơn hàng hiện có
   * Tạo khách hàng từ số điện thoại trong đơn hàng nếu chưa tồn tại
   */
  async dongBoTuTatCaDonHang(): Promise<{ created: number; updated: number }> {
    let created = 0;
    let updated = 0;
    const processedPhones = new Set<string>();

    // Lấy tất cả đơn hàng có số điện thoại
    const orders = await this.orderModel
      .find({
        customerPhone: { $exists: true, $nin: [null, ''] },
      })
      .select('customerPhone customerName customerEmail customerAddress')
      .lean()
      .exec();

    this.logger.log(`Tìm thấy ${orders.length} đơn hàng có số điện thoại`);

    for (const order of orders) {
      if (!order.customerPhone || processedPhones.has(order.customerPhone)) {
        continue;
      }

      try {
        const existing = await this.timTheoSoDienThoai(order.customerPhone);
        if (!existing) {
          // Tạo mới khách hàng
          const khachHang = new this.khachHangModel({
            soDienThoai: order.customerPhone,
            ten: order.customerName,
            email: order.customerEmail,
            diaChi: order.customerAddress,
          });
          await khachHang.save();
          created++;
          this.logger.log(`Đã tạo khách hàng: ${order.customerPhone}`);
        } else {
          // Cập nhật thông tin nếu thiếu
          const updateData: any = {};
          if (order.customerName && !existing.ten) updateData.ten = order.customerName;
          if (order.customerEmail && !existing.email) updateData.email = order.customerEmail;
          if (order.customerAddress && !existing.diaChi) updateData.diaChi = order.customerAddress;

          if (Object.keys(updateData).length > 0) {
            await this.capNhat(existing._id.toString(), updateData);
            updated++;
            this.logger.log(`Đã cập nhật khách hàng: ${order.customerPhone}`);
          }
        }
        processedPhones.add(order.customerPhone);
      } catch (error: any) {
        this.logger.warn(`Lỗi khi đồng bộ khách hàng ${order.customerPhone}: ${error.message}`);
      }
    }

    return { created, updated };
  }

  private xacDinhLoaiKhachHang(tongChiTieu: number): LoaiKhachHang {
    if (tongChiTieu >= 2_000_000) return LoaiKhachHang.VIP;
    if (tongChiTieu >= 500_000) return LoaiKhachHang.TIEM_NANG;
    return LoaiKhachHang.THUONG;
  }

  async xepLoaiTatCaKhachHang(): Promise<{ updated: number }> {
    const allCustomers = await this.khachHangModel.find().exec();
    let updated = 0;

    for (const customer of allCustomers) {
      const phone = customer.soDienThoai;
      if (!phone) continue;

      const orderStats = await this.orderModel.aggregate([
        {
          $match: {
            customerPhone: phone,
            status: { $nin: ['cancelled'] },
          },
        },
        {
          $group: {
            _id: null,
            tongChiTieu: { $sum: '$total' },
            soLanMua: { $sum: 1 },
          },
        },
      ]);

      const tongChiTieu = orderStats[0]?.tongChiTieu || 0;
      const soLanMua = orderStats[0]?.soLanMua || 0;
      const loaiKhachHang = this.xacDinhLoaiKhachHang(tongChiTieu);

      await this.khachHangModel.findByIdAndUpdate(customer._id, {
        tongChiTieu,
        soLanMua,
        loaiKhachHang,
      });
      updated++;
    }

    this.logger.log(`Đã xếp loại ${updated} khách hàng`);
    return { updated };
  }
}


