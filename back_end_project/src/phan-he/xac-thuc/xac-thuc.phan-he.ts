import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { DichVuXacThuc } from './xac-thuc.dich-vu';
import { DieuKhienXacThuc } from './xac-thuc.dieu-khien';
import { ChienLuocJwt } from './chien-luoc/chien-luoc-jwt';
import { ChienLuocDiaPhuong } from './chien-luoc/chien-luoc-dia-phuong';
import { PhanHeNguoiDung } from '../nguoi-dung/nguoi-dung.phan-he';
import { CauHinhJwt } from '../../cau-hinh/cau-hinh-jwt';

@Module({
  imports: [
    PhanHeNguoiDung,
    PassportModule,
    JwtModule.registerAsync({
      useClass: CauHinhJwt,
    }),
  ],
  controllers: [DieuKhienXacThuc],
  providers: [DichVuXacThuc, ChienLuocJwt, ChienLuocDiaPhuong],
  exports: [DichVuXacThuc],
})
export class PhanHeXacThuc {}

