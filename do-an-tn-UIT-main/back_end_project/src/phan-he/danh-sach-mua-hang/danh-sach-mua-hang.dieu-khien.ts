import { Body, Controller, Delete, Get, Param, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BaoVeJwt } from '../../dung-chung/bao-ve/bao-ve-jwt';
import { BaoVeVaiTro } from '../../dung-chung/bao-ve/bao-ve-vai-tro';
import { VaiTro } from '../../dung-chung/trang-tri/vai-tro.trang-tri';
import { VaiTroNguoiDung } from '../../dung-chung/liet-ke/vai-tro-nguoi-dung.enum';
import { NguoiDungHienTai } from '../../dung-chung/trang-tri/nguoi-dung-hien-tai.trang-tri';
import { DichVuDanhSachMuaHang } from './danh-sach-mua-hang.dich-vu';
import { TaoDanhSachMuaHangDto } from './dto/tao-danh-sach-mua-hang.dto';
import { CapNhatDanhSachMuaHangDto } from './dto/cap-nhat-danh-sach-mua-hang.dto';

@ApiTags('danh-sach-mua-hang')
@ApiBearerAuth()
@UseGuards(BaoVeJwt, BaoVeVaiTro)
@VaiTro(VaiTroNguoiDung.CUSTOMER)
@Controller('shopping-lists')
export class DieuKhienDanhSachMuaHang {
  constructor(private readonly dichVu: DichVuDanhSachMuaHang) {}

  @Post()
  @ApiOperation({ summary: 'Tạo danh sách mua hàng (Customer)' })
  @ApiResponse({ status: 201, description: 'Created / updated active shopping list' })
  tao(@NguoiDungHienTai('id') customerId: string, @Body() dto: TaoDanhSachMuaHangDto) {
    return this.dichVu.tao(customerId, dto);
  }

  @Get('active')
  @ApiOperation({ summary: 'Lấy danh sách mua hàng ACTIVE (Customer)' })
  @ApiResponse({ status: 200, description: 'Return active shopping list (or null)' })
  layDangHoatDong(@NguoiDungHienTai('id') customerId: string) {
    return this.dichVu.layDanhSachDangHoatDong(customerId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật danh sách mua hàng (Customer)' })
  @ApiResponse({ status: 200, description: 'Updated shopping list' })
  capNhat(
    @NguoiDungHienTai('id') customerId: string,
    @Param('id') id: string,
    @Body() dto: CapNhatDanhSachMuaHangDto,
  ) {
    return this.dichVu.capNhat(customerId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xoá danh sách mua hàng (Customer)' })
  @ApiResponse({ status: 200, description: 'Deleted shopping list' })
  xoa(@NguoiDungHienTai('id') customerId: string, @Param('id') id: string) {
    return this.dichVu.xoa(customerId, id);
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'Đánh dấu hoàn thành danh sách mua hàng (Customer)' })
  @ApiResponse({ status: 200, description: 'Completed shopping list' })
  hoanThanh(@NguoiDungHienTai('id') customerId: string, @Param('id') id: string) {
    return this.dichVu.hoanThanh(customerId, id);
  }
}


