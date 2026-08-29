import { pluginDaCuaHang } from '../../../dung-chung/da-cua-hang/plugin-da-cua-hang';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { VaiTroNguoiDung } from '../../../dung-chung/liet-ke/vai-tro-nguoi-dung.enum';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  /** Cửa hàng sở hữu bản ghi này — gán tự động bởi pluginDaCuaHang. */
  storeId?: Types.ObjectId;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  fullName: string;

  @Prop({ type: String, enum: VaiTroNguoiDung, default: VaiTroNguoiDung.STAFF })
  role: VaiTroNguoiDung;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  phone?: string;

  @Prop()
  address?: string;

  @Prop()
  lastLogin?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);


UserSchema.index({ storeId: 1, role: 1 });

UserSchema.plugin(pluginDaCuaHang);
