import { Module } from '@nestjs/common';
import { DichVuGiaoDich } from './giao-dich.dich-vu';
import { DieuKhienGiaoDich } from './giao-dich.dieu-khien';
import { PhanHeDonHang } from '../don-hang/don-hang.phan-he';
import { PhanHeNhapHang } from '../nhap-hang/nhap-hang.phan-he';

@Module({
  imports: [PhanHeDonHang, PhanHeNhapHang],
  controllers: [DieuKhienGiaoDich],
  providers: [DichVuGiaoDich],
  exports: [DichVuGiaoDich],
})
export class PhanHeGiaoDich {}

