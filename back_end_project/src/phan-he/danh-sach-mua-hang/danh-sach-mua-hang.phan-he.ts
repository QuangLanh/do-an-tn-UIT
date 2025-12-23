import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DichVuDanhSachMuaHang } from './danh-sach-mua-hang.dich-vu';
import { DieuKhienDanhSachMuaHang } from './danh-sach-mua-hang.dieu-khien';
import {
  DanhSachMuaHang,
  DanhSachMuaHangSchema,
} from './schemas/danh-sach-mua-hang.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DanhSachMuaHang.name, schema: DanhSachMuaHangSchema },
    ]),
  ],
  controllers: [DieuKhienDanhSachMuaHang],
  providers: [DichVuDanhSachMuaHang],
  exports: [DichVuDanhSachMuaHang],
})
export class PhanHeDanhSachMuaHang {}


