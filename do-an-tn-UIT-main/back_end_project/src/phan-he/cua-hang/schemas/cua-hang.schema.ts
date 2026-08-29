import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { GoiCuoc, NganhHang } from '../../../dung-chung/liet-ke/nganh-hang.enum';

export type CuaHangDocument = CuaHang & Document;

/**
 * Cửa hàng = một tenant của hệ thống.
 *
 * Đây là collection duy nhất KHÔNG gắn `pluginDaCuaHang` — nó nằm trên mọi cửa hàng.
 */
@Schema({ timestamps: true, collection: 'stores' })
export class CuaHang {
  /** Mã định danh trên URL: /s/tap-hoa-minh-anh — chỉ chữ thường, số và dấu gạch ngang. */
  @Prop({ required: true, unique: true, index: true, trim: true, lowercase: true })
  ma: string;

  @Prop({ required: true, trim: true })
  ten: string;

  @Prop({ type: String, enum: NganhHang, default: NganhHang.TAP_HOA })
  nganhHang: NganhHang;

  @Prop()
  diaChi?: string;

  @Prop()
  soDienThoai?: string;

  @Prop()
  email?: string;

  /** Tắt cửa hàng: chặn đăng nhập và mọi API của cửa hàng đó. */
  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: String, enum: GoiCuoc, default: GoiCuoc.DUNG_THU })
  goiCuoc: GoiCuoc;

  /** Hết hạn thì khóa thao tác ghi nhưng vẫn cho xem và xuất dữ liệu. */
  @Prop()
  ngayHetHan?: Date;
}

export const CuaHangSchema = SchemaFactory.createForClass(CuaHang);
