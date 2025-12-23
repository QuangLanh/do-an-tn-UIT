import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { VaiTroNguoiDung } from '../../../dung-chung/liet-ke/vai-tro-nguoi-dung.enum';

export type KhachHangDocument = KhachHang & Document;

@Schema({ timestamps: true, collection: 'customers' })
export class KhachHang {
  @Prop({ required: true, unique: true })
  soDienThoai: string;

  @Prop()
  ten?: string;

  @Prop({
    type: String,
    enum: VaiTroNguoiDung,
    default: VaiTroNguoiDung.CUSTOMER,
  })
  role: VaiTroNguoiDung;
}

export const KhachHangSchema = SchemaFactory.createForClass(KhachHang);


