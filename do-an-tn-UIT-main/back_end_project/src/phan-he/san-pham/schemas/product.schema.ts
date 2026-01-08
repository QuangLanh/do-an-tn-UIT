import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  sku: string;

  @Prop()
  description?: string;

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

