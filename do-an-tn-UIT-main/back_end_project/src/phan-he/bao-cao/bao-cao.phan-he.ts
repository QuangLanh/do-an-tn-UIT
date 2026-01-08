import { Module } from '@nestjs/common';
import { DichVuBaoCao } from './bao-cao.dich-vu';
import { DieuKhienBaoCao } from './bao-cao.dieu-khien';
import { PhanHeGiaoDich } from '../giao-dich/giao-dich.phan-he';
import { PhanHeDonHang } from '../don-hang/don-hang.phan-he';
import { PhanHeNhapHang } from '../nhap-hang/nhap-hang.phan-he';
import { PhanHeSanPham } from '../san-pham/san-pham.phan-he';

@Module({
  imports: [PhanHeGiaoDich, PhanHeDonHang, PhanHeNhapHang, PhanHeSanPham],
  controllers: [DieuKhienBaoCao],
  providers: [DichVuBaoCao],
  exports: [DichVuBaoCao],
})
export class PhanHeBaoCao {}

