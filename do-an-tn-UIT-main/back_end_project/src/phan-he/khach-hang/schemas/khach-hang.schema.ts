import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { VaiTroNguoiDung } from '../../../dung-chung/liet-ke/vai-tro-nguoi-dung.enum';

export type KhachHangDocument = KhachHang & Document;

export enum LoaiKhachHang {
  THUONG = 'thuong',       // Khách thường (< 500k)
  TIEM_NANG = 'tiem-nang', // Khách tiềm năng (500k - 2M)
  VIP = 'vip',             // Khách VIP (> 2M)
}

@Schema({ timestamps: true, collection: 'customers' })
export class KhachHang {
  @Prop({ required: true, unique: true })
  soDienThoai: string;

  @Prop()
  ten?: string;

  @Prop()
  email?: string;

  @Prop()
  diaChi?: string;

  @Prop({
    type: String,
    enum: VaiTroNguoiDung,
    default: VaiTroNguoiDung.CUSTOMER,
  })
  role: VaiTroNguoiDung;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: String, enum: LoaiKhachHang, default: LoaiKhachHang.THUONG })
  loaiKhachHang: LoaiKhachHang;

  @Prop({ default: 0 })
  tongChiTieu: number;

  @Prop({ default: 0 })
  soLanMua: number;
}

export const KhachHangSchema = SchemaFactory.createForClass(KhachHang);


