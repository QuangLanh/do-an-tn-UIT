import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DichVuNhaCungCap } from './nha-cung-cap.dich-vu';
import { TaoNhaCungCapDto } from './tao-nha-cung-cap.dto';
import { CapNhatNhaCungCapDto } from './cap-nhat-nha-cung-cap.dto';

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

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: CapNhatNhaCungCapDto) {
    return this.dichVu.update(id, updateDto);
  }

  // API Xóa phải nằm ở đây và được import Delete ở dòng đầu tiên
  @Delete(':id')
  xoa(@Param('id') id: string) {
    return this.dichVu.xoa(id);
  }
}