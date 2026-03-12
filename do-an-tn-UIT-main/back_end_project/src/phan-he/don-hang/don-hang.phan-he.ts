import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DichVuDonHang } from './don-hang.dich-vu';
import { DieuKhienDonHang } from './don-hang.dieu-khien';
import { Order, OrderSchema } from './schemas/order.schema';
import { PhanHeSanPham } from '../san-pham/san-pham.phan-he';
import { PhanHeKhachHang } from '../khach-hang/khach-hang.phan-he';
import { PhanHeNhapHang } from '../nhap-hang/nhap-hang.phan-he';
import { DonHangGateway } from './don-hang.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    PhanHeSanPham,
    PhanHeKhachHang,
    PhanHeNhapHang,
  ],
  controllers: [DieuKhienDonHang],
  providers: [DichVuDonHang, DonHangGateway],
  exports: [DichVuDonHang, DonHangGateway],
})
export class PhanHeDonHang {}

