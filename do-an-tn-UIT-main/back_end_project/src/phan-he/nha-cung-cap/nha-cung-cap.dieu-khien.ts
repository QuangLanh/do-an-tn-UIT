import { Controller, Get, Post, Body } from '@nestjs/common';
import { DichVuNhaCungCap } from './nha-cung-cap.dich-vu';
import { TaoNhaCungCapDto } from './tao-nha-cung-cap.dto';

@Controller('suppliers') 
export class DieuKhienNhaCungCap {
  constructor(private readonly dichVu: DichVuNhaCungCap) {}

  @Post()
  taoMoi(@Body() dto: TaoNhaCungCapDto) {
    return this.dichVu.taoMoi(dto);
  }

  @Get()
  layTatCa() {
    return this.dichVu.layTatCa();
  }
}