import { pluginDaCuaHang } from '../../dung-chung/da-cua-hang/plugin-da-cua-hang';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TaiLieuNhaCungCap = NhaCungCap & Document;

@Schema({ timestamps: true, collection: 'nha-cung-cap' })
export class NhaCungCap {
  /** Cửa hàng sở hữu bản ghi này — gán tự động bởi pluginDaCuaHang. */
  storeId?: Types.ObjectId;

  @Prop({ required: true })
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
SchemaNhaCungCap.index({ storeId: 1, code: 1 }, { unique: true });

SchemaNhaCungCap.plugin(pluginDaCuaHang);
