import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type StockBatchDocument = StockBatch & Document;

/** Trạng thái hạn sử dụng theo yêu cầu */
export type ExpiryStatus = 'normal' | 'near_expiry' | 'critical' | 'expired';

@Schema({ timestamps: true })
export class StockBatch {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  product: Types.ObjectId;

  @Prop({ required: true })
  quantity: number;

  @Prop()
  manufactureDate?: Date;

  @Prop({ required: true })
  expiryDate: Date;

  @Prop({ type: Types.ObjectId, ref: 'Purchase' })
  purchaseId?: Types.ObjectId;

  @Prop()
  purchaseNumber?: string;

  @Prop({ default: () => new Date() })
  receivedAt: Date;

  @Prop()
  lotNumber?: string;

  @Prop()
  productName?: string;
}

export const StockBatchSchema = SchemaFactory.createForClass(StockBatch);

StockBatchSchema.index({ product: 1, expiryDate: 1 });
StockBatchSchema.index({ purchaseId: 1 });
StockBatchSchema.index({ expiryDate: 1 });
