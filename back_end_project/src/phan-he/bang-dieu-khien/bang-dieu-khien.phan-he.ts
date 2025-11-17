import { Module } from '@nestjs/common';
import { DichVuBangDieuKhien } from './bang-dieu-khien.dich-vu';
import { DieuKhienBangDieuKhien } from './bang-dieu-khien.dieu-khien';
import { PhanHeGiaoDich } from '../giao-dich/giao-dich.phan-he';
import { PhanHeDonHang } from '../don-hang/don-hang.phan-he';
import { PhanHeSanPham } from '../san-pham/san-pham.phan-he';

@Module({
  imports: [PhanHeGiaoDich, PhanHeDonHang, PhanHeSanPham],
  controllers: [DieuKhienBangDieuKhien],
  providers: [DichVuBangDieuKhien],
})
export class PhanHeBangDieuKhien {}

