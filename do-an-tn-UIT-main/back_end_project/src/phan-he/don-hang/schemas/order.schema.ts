import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { TrangThaiDonHang } from '../../../dung-chung/liet-ke/trang-thai-don-hang.enum';

export type OrderDocument = Order & Document;

export class OrderItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  product: Types.ObjectId;

  @Prop({ required: true })
  productName: string;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  price: number; // Đây là GIÁ BÁN

  // --- BỔ SUNG ĐOẠN NÀY ---
  @Prop({ required: true, default: 0 }) 
  importPrice: number; // Đây là GIÁ NHẬP (GIÁ VỐN)
  // ------------------------

  @Prop({ required: true })
  subtotal: number; // Thường là price * quantity
}

@Schema({ timestamps: true })
export class Order {
  // ... (Giữ nguyên các phần khác của Order)
  @Prop({ required: true, unique: true })
  orderNumber: string;

  @Prop({ type: [OrderItem], required: true })
  items: OrderItem[];

  @Prop({ required: true })
  subtotal: number;

  @Prop({ default: 0 })
  tax: number;

  @Prop({ default: 0 })
  discount: number;

  @Prop({ required: true })
  total: number;

  @Prop({
    type: String,
    enum: TrangThaiDonHang,
    default: TrangThaiDonHang.PENDING,
  })
  status: TrangThaiDonHang;

  @Prop()
  customerName?: string;

  @Prop()
  customerPhone?: string;

  @Prop()
  notes?: string;

  @Prop()
  paymentMethod?: string;

  @Prop({
    type: String,
    enum: ['PAID', 'DEBT'],
    default: 'PAID',
  })
  paymentStatus: 'PAID' | 'DEBT';

  @Prop()
  paidAt?: Date;

  @Prop({ default: false })
  wasDebt: boolean;

  // Thêm các field cho đổi/trả hàng
  @Prop({
    type: String,
    enum: ['SALE', 'EXCHANGE', 'RETURN'],
    default: 'SALE',
  })
  orderType: 'SALE' | 'EXCHANGE' | 'RETURN';

  @Prop()
  relatedOrderCode?: string; // Mã đơn hàng gốc (cho EXCHANGE/RETURN)

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

// Index
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ orderType: 1 });
OrderSchema.index({ relatedOrderCode: 1 });
OrderSchema.index({ customerPhone: 1 });