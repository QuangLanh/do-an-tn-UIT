import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OtpDocument = Otp & Document;

@Schema({ timestamps: true })
export class Otp {
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
