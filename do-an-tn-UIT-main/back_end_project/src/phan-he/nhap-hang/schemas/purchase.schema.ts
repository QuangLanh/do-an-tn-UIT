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

  // Thông tin lô hàng (tùy chọn) - phục vụ quản lý hạn sử dụng
  @Prop()
  expiryDate?: Date;

  @Prop()
  manufactureDate?: Date;

  @Prop()
  lotNumber?: string;
}

@Schema({ timestamps: true })
export class Purchase {
  @Prop({ required: true, unique: true })
  purchaseNumber: string;

  @Prop({ type: [PurchaseItem], required: true })
  items: PurchaseItem[];

  @Prop({ required: true })
  supplier: string;

   // Liên kết chuẩn tới nhà cung cấp trong hệ thống (tùy chọn)
  @Prop({ type: Types.ObjectId, ref: 'NhaCungCap', required: false })
  supplierId?: Types.ObjectId;

  // Snapshot tên NCC tại thời điểm nhập để tránh thay đổi lịch sử khi đổi tên NCC
  @Prop()
  supplierNameSnapshot?: string;

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

