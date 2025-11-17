import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PurchaseDocument = Purchase & Document;

export class PurchaseItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  product: Types.ObjectId;

  @Prop({ required: true })
  productName: string;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  purchasePrice: number;

  @Prop({ required: true })
  subtotal: number;
}

@Schema({ timestamps: true })
export class Purchase {
  @Prop({ required: true, unique: true })
  purchaseNumber: string;

  @Prop({ type: [PurchaseItem], required: true })
  items: PurchaseItem[];

  @Prop({ required: true })
  supplier: string;

  @Prop()
  supplierContact?: string;

  @Prop({ required: true })
  total: number;

  @Prop()
  notes?: string;

  @Prop({ default: 'pending' })
  status: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;
}

export const PurchaseSchema = SchemaFactory.createForClass(Purchase);

// Index for better query performance
PurchaseSchema.index({ purchaseNumber: 1 });
PurchaseSchema.index({ supplier: 1 });
PurchaseSchema.index({ createdAt: -1 });

