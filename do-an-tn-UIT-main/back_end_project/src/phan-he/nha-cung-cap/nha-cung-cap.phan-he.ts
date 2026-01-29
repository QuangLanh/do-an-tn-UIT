import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DieuKhienNhaCungCap } from './nha-cung-cap.dieu-khien';
import { DichVuNhaCungCap } from './nha-cung-cap.dich-vu';
import { NhaCungCap, SchemaNhaCungCap } from './nha-cung-cap.thuc-the';

@Module({
  imports: [MongooseModule.forFeature([{ name: NhaCungCap.name, schema: SchemaNhaCungCap }])],
  controllers: [DieuKhienNhaCungCap],
  providers: [DichVuNhaCungCap],
  exports: [DichVuNhaCungCap],
})
export class PhanHeNhaCungCap {}