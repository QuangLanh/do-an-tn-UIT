import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DanhSachMuaHangDocument = DanhSachMuaHang & Document;

export enum TrangThaiDanhSachMuaHang {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
}

export class MucDanhSachMuaHang {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ required: true, min: 1 })
  quantity: number;
}

@Schema({ timestamps: true, collection: 'shoppinglists' })
export class DanhSachMuaHang {
  @Prop({ type: Types.ObjectId, ref: 'KhachHang', required: true, index: true })
  customerId: Types.ObjectId;

  @Prop({ type: [MucDanhSachMuaHang], default: [] })
  items: MucDanhSachMuaHang[];

  @Prop({
    type: String,
    enum: TrangThaiDanhSachMuaHang,
    default: TrangThaiDanhSachMuaHang.ACTIVE,
    index: true,
  })
  status: TrangThaiDanhSachMuaHang;
}

export const DanhSachMuaHangSchema = SchemaFactory.createForClass(DanhSachMuaHang);

DanhSachMuaHangSchema.index({ customerId: 1, status: 1 });


