import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DichVuDonHang } from './don-hang.dich-vu';
import { DieuKhienDonHang } from './don-hang.dieu-khien';
import { Order, OrderSchema } from './schemas/order.schema';
import { PhanHeSanPham } from '../san-pham/san-pham.phan-he';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    PhanHeSanPham,
  ],
  controllers: [DieuKhienDonHang],
  providers: [DichVuDonHang],
  exports: [DichVuDonHang],
})
export class PhanHeDonHang {}

