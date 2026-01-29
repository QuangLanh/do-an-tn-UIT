import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TaiLieuNhaCungCap = NhaCungCap & Document;

@Schema({ timestamps: true, collection: 'nha-cung-cap' })
export class NhaCungCap {
  @Prop({ required: true, unique: true })
  code: string; // Mã NCC (Ví dụ: NCC001)

  @Prop({ required: true })
  name: string; // Tên nhà cung cấp

  @Prop({ required: true })
  phone: string; // Số điện thoại

  @Prop()
  address: string; // Địa chỉ

  @Prop()
  email: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const SchemaNhaCungCap = SchemaFactory.createForClass(NhaCungCap);