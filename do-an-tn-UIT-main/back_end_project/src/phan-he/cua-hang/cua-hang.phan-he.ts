import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CuaHang, CuaHangSchema } from './schemas/cua-hang.schema';
import { DichVuCuaHang } from './cua-hang.dich-vu';
import { DieuKhienCuaHang } from './cua-hang.dieu-khien';

/**
 * Global vì middleware ngữ cảnh cửa hàng cần DichVuCuaHang để tra mã cửa hàng,
 * và middleware được đăng ký ở module gốc.
 */
@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: CuaHang.name, schema: CuaHangSchema }]),
  ],
  controllers: [DieuKhienCuaHang],
  providers: [DichVuCuaHang],
  exports: [DichVuCuaHang],
})
export class PhanHeCuaHang {}
