import { pluginDaCuaHang } from '../../../dung-chung/da-cua-hang/plugin-da-cua-hang';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OtpDocument = Otp & Document;

@Schema({ timestamps: true })
export class Otp {
  /** Cửa hàng sở hữu bản ghi này — gán tự động bởi pluginDaCuaHang. */
  storeId?: Types.ObjectId;

  @Prop({ required: true, index: true })
  phone: string;

  @Prop({ required: true })
  code: string;

  @Prop({ required: true, default: Date.now, expires: 300 }) // Expires in 5 minutes
  expiresAt: Date;

  @Prop({ default: false })
  used: boolean;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);

OtpSchema.plugin(pluginDaCuaHang);
