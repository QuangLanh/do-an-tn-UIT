import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DichVuKhachHang } from './khach-hang.dich-vu';
import { KhachHang, KhachHangSchema } from './schemas/khach-hang.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: KhachHang.name, schema: KhachHangSchema },
    ]),
  ],
  providers: [DichVuKhachHang],
  exports: [DichVuKhachHang],
})
export class PhanHeKhachHang {}


