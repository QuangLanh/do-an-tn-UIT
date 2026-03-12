import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DichVuNhapHang } from './nhap-hang.dich-vu';
import { DichVuGoiYNhapHang } from './goi-y-nhap-hang.dich-vu';
import { DichVuStockBatch } from './stock-batch.dich-vu';
import { DieuKhienNhapHang } from './nhap-hang.dieu-khien';
import { Purchase, PurchaseSchema } from './schemas/purchase.schema';
import { StockBatch, StockBatchSchema } from './schemas/stock-batch.schema';
import { Order, OrderSchema } from '../don-hang/schemas/order.schema';
import { Product, ProductSchema } from '../san-pham/schemas/product.schema';
import { PhanHeSanPham } from '../san-pham/san-pham.phan-he';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Purchase.name, schema: PurchaseSchema },
      { name: StockBatch.name, schema: StockBatchSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
    PhanHeSanPham,
  ],
  controllers: [DieuKhienNhapHang],
  providers: [DichVuNhapHang, DichVuGoiYNhapHang, DichVuStockBatch],
  exports: [DichVuNhapHang, DichVuStockBatch],
})
export class PhanHeNhapHang {}

