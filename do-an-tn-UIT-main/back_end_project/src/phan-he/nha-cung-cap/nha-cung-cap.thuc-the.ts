import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TaiLieuNhaCungCap = NhaCungCap & Document;

@Schema({ timestamps: true, collection: 'nha-cung-cap' })
export class NhaCungCap {
  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  phone: string;

  @Prop()
  address: string;

  @Prop()
  email: string;

  // THÊM DÒNG NÀY ĐỂ DATABASE CHỊU LƯU
  @Prop()
  contact: string; 

  @Prop({ default: true })
  isActive: boolean;
}

export const SchemaNhaCungCap = SchemaFactory.createForClass(NhaCungCap);