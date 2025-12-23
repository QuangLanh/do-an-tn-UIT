import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { KhachHang, KhachHangDocument } from './schemas/khach-hang.schema';

@Injectable()
export class DichVuKhachHang {
  constructor(
    @InjectModel(KhachHang.name)
    private khachHangModel: Model<KhachHangDocument>,
  ) {}

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
}


