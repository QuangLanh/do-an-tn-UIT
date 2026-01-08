import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DichVuNguoiDung } from './nguoi-dung.dich-vu';
import { DieuKhienNguoiDung } from './nguoi-dung.dieu-khien';
import { User, UserSchema } from './schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [DieuKhienNguoiDung],
  providers: [DichVuNguoiDung],
  exports: [DichVuNguoiDung],
})
export class PhanHeNguoiDung {}

