import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DichVuSanPham } from './san-pham.dich-vu';
import { DieuKhienSanPham } from './san-pham.dieu-khien';
import { Product, ProductSchema } from './schemas/product.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
  ],
  controllers: [DieuKhienSanPham],
  providers: [DichVuSanPham],
  exports: [DichVuSanPham],
})
export class PhanHeSanPham {}

