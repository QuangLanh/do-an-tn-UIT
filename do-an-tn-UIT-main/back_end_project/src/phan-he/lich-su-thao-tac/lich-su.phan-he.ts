import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DichVuLichSuThaoTac } from './lich-su.dich-vu';
import { DieuKhienLichSuThaoTac } from './lich-su.dieu-khien';
import { LichSuThaoTac, LichSuThaoTacSchema } from './schemas/lich-su.schema';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LichSuThaoTac.name, schema: LichSuThaoTacSchema },
    ]),
  ],
  controllers: [DieuKhienLichSuThaoTac],
  providers: [DichVuLichSuThaoTac],
  exports: [DichVuLichSuThaoTac],
})
export class PhanHeLichSuThaoTac {}
