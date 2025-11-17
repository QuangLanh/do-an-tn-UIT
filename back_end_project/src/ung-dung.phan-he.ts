import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UngDungDieuKhien } from './ung-dung.dieu-khien';
import { UngDungDichVu } from './ung-dung.dich-vu';
import { CauHinhCoSoDuLieu } from './cau-hinh/cau-hinh-co-so-du-lieu';
import { PhanHeNguoiDung } from './phan-he/nguoi-dung/nguoi-dung.phan-he';
import { PhanHeXacThuc } from './phan-he/xac-thuc/xac-thuc.phan-he';
import { PhanHeSanPham } from './phan-he/san-pham/san-pham.phan-he';
import { PhanHeDonHang } from './phan-he/don-hang/don-hang.phan-he';
import { PhanHeNhapHang } from './phan-he/nhap-hang/nhap-hang.phan-he';
import { PhanHeGiaoDich } from './phan-he/giao-dich/giao-dich.phan-he';
import { PhanHeBaoCao } from './phan-he/bao-cao/bao-cao.phan-he';
import { PhanHeBangDieuKhien } from './phan-he/bang-dieu-khien/bang-dieu-khien.phan-he';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      useClass: CauHinhCoSoDuLieu,
    }),
    PhanHeXacThuc,
    PhanHeNguoiDung,
    PhanHeSanPham,
    PhanHeDonHang,
    PhanHeNhapHang,
    PhanHeGiaoDich,
    PhanHeBaoCao,
    PhanHeBangDieuKhien,
  ],
  controllers: [UngDungDieuKhien],
  providers: [UngDungDichVu],
})
export class UngDungPhanHe {}

