import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  DanhSachMuaHang,
  DanhSachMuaHangDocument,
  TrangThaiDanhSachMuaHang,
} from './schemas/danh-sach-mua-hang.schema';
import { TaoDanhSachMuaHangDto } from './dto/tao-danh-sach-mua-hang.dto';
import { CapNhatDanhSachMuaHangDto } from './dto/cap-nhat-danh-sach-mua-hang.dto';

@Injectable()
export class DichVuDanhSachMuaHang {
  constructor(
    @InjectModel(DanhSachMuaHang.name)
    private danhSachModel: Model<DanhSachMuaHangDocument>,
  ) {}

  private toObjectId(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Id không hợp lệ');
    }
    return new Types.ObjectId(id);
  }

  async layDanhSachDangHoatDong(customerId: string) {
    const cid = this.toObjectId(customerId);
    return this.danhSachModel
      .findOne({ customerId: cid, status: TrangThaiDanhSachMuaHang.ACTIVE })
      .populate('items.productId')
      .exec();
  }

  /**
   * Tạo danh sách mua hàng cho khách.
   * Quy ước: mỗi khách chỉ có 1 danh sách ACTIVE tại 1 thời điểm.
   * => nếu đã có ACTIVE thì cập nhật items thay vì tạo mới.
   */
  async tao(customerId: string, dto: TaoDanhSachMuaHangDto) {
    const cid = this.toObjectId(customerId);
    const active = await this.danhSachModel.findOne({
      customerId: cid,
      status: TrangThaiDanhSachMuaHang.ACTIVE,
    });

    const items = (dto.items || []).map((i) => ({
      productId: this.toObjectId(i.productId),
      quantity: i.quantity,
    }));

    if (active) {
      active.items = items as any;
      return active.save();
    }

    return new this.danhSachModel({
      customerId: cid,
      items,
      status: TrangThaiDanhSachMuaHang.ACTIVE,
    }).save();
  }

  async capNhat(customerId: string, id: string, dto: CapNhatDanhSachMuaHangDto) {
    const cid = this.toObjectId(customerId);
    const list = await this.danhSachModel.findById(id);
    if (!list) throw new NotFoundException('Không tìm thấy danh sách mua hàng');

    if (list.customerId.toString() !== cid.toString()) {
      throw new NotFoundException('Không tìm thấy danh sách mua hàng');
    }

    if (list.status !== TrangThaiDanhSachMuaHang.ACTIVE) {
      throw new BadRequestException('Chỉ có thể chỉnh sửa danh sách đang hoạt động');
    }

    list.items = (dto.items || []).map((i) => ({
      productId: this.toObjectId(i.productId),
      quantity: i.quantity,
    })) as any;

    return list.save();
  }

  async xoa(customerId: string, id: string) {
    const cid = this.toObjectId(customerId);
    const list = await this.danhSachModel.findById(id);
    if (!list) throw new NotFoundException('Không tìm thấy danh sách mua hàng');

    if (list.customerId.toString() !== cid.toString()) {
      throw new NotFoundException('Không tìm thấy danh sách mua hàng');
    }

    await this.danhSachModel.deleteOne({ _id: list._id }).exec();
    return { deleted: true };
  }

  async hoanThanh(customerId: string, id: string) {
    const cid = this.toObjectId(customerId);
    const list = await this.danhSachModel.findById(id);
    if (!list) throw new NotFoundException('Không tìm thấy danh sách mua hàng');

    if (list.customerId.toString() !== cid.toString()) {
      throw new NotFoundException('Không tìm thấy danh sách mua hàng');
    }

    list.status = TrangThaiDanhSachMuaHang.COMPLETED;
    return list.save();
  }
}


