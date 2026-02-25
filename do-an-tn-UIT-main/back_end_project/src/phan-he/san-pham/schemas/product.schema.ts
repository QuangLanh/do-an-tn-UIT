import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  sku: string;

  @Prop()
  description?: string;

  // Thông tin mô tả thêm cho báo cáo / hiển thị
  @Prop()
  brand?: string;

  @Prop()
  origin?: string;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true })
  purchasePrice: number;

  @Prop({ required: true })
  salePrice: number;

  @Prop({ required: true, default: 0 })
  stock: number;

  @Prop({ default: 10 })
  minStockLevel: number;

  @Prop()
  unit?: string;

  @Prop()
  barcode?: string;

  @Prop()
  imageUrl?: string;

  // Danh sách tag hỗ trợ tìm kiếm/lọc
  @Prop({ type: [String], default: [] })
  tags?: string[];

  // Nhà cung cấp mặc định (tùy chọn)
  @Prop({ type: Types.ObjectId, ref: 'NhaCungCap' })
  defaultSupplierId?: Types.ObjectId;

  // Thời hạn sử dụng tính theo tháng (nếu có)
  @Prop()
  shelfLifeMonths?: number;

  @Prop({ default: true })
  isActive: boolean;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

// Index for better search performance
ProductSchema.index({ name: 'text', sku: 'text', barcode: 'text' });

// Uniqueness constraints to prevent duplicate products
// - SKU: required => unique
// - Barcode: optional => unique if provided (sparse)
ProductSchema.index({ sku: 1 }, { unique: true });
ProductSchema.index({ barcode: 1 }, { unique: true, sparse: true });

