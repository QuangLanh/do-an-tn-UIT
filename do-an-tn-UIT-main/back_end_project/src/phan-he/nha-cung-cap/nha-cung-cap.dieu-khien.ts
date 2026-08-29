import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DichVuNhaCungCap } from './nha-cung-cap.dich-vu';
import { TaoNhaCungCapDto } from './tao-nha-cung-cap.dto';
import { CapNhatNhaCungCapDto } from './cap-nhat-nha-cung-cap.dto';
import { BaoVeJwt } from '../../dung-chung/bao-ve/bao-ve-jwt';
import { BaoVeVaiTro } from '../../dung-chung/bao-ve/bao-ve-vai-tro';
import { VaiTro } from '../../dung-chung/trang-tri/vai-tro.trang-tri';
import { VaiTroNguoiDung } from '../../dung-chung/liet-ke/vai-tro-nguoi-dung.enum';

@ApiTags('nha-cung-cap')
@ApiBearerAuth()
@UseGuards(BaoVeJwt, BaoVeVaiTro)
@Controller('suppliers')
export class DieuKhienNhaCungCap {
  constructor(private readonly dichVu: DichVuNhaCungCap) {}

  @Post()
  @VaiTro(VaiTroNguoiDung.ADMIN, VaiTroNguoiDung.STAFF)
  @ApiOperation({ summary: 'Tạo nhà cung cấp (Admin, Nhân viên)' })
  taoMoi(@Body() dto: TaoNhaCungCapDto) {
    return this.dichVu.taoMoi(dto);
  }

  @Get()
  @VaiTro(VaiTroNguoiDung.ADMIN, VaiTroNguoiDung.STAFF)
  @ApiOperation({ summary: 'Danh sách nhà cung cấp của cửa hàng' })
  layTatCa() {
    return this.dichVu.layTatCa();
  }

  @Patch(':id')
  @VaiTro(VaiTroNguoiDung.ADMIN, VaiTroNguoiDung.STAFF)
  @ApiOperation({ summary: 'Cập nhật nhà cung cấp (Admin, Nhân viên)' })
  update(@Param('id') id: string, @Body() updateDto: CapNhatNhaCungCapDto) {
    return this.dichVu.update(id, updateDto);
  }

  @Delete(':id')
  @VaiTro(VaiTroNguoiDung.ADMIN)
  @ApiOperation({ summary: 'Xóa nhà cung cấp (chỉ Admin)' })
  xoa(@Param('id') id: string) {
    return this.dichVu.xoa(id);
  }
}
