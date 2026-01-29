import { Controller, Get, Patch, Post, Param, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DichVuKhachHang } from './khach-hang.dich-vu';
import { CapNhatKhachHangDto } from './dto/cap-nhat-khach-hang.dto';
import { TaoKhachHangDto } from './dto/tao-khach-hang.dto';
import { BaoVeJwt } from '../../dung-chung/bao-ve/bao-ve-jwt';
import { BaoVeVaiTro } from '../../dung-chung/bao-ve/bao-ve-vai-tro';
import { VaiTro } from '../../dung-chung/trang-tri/vai-tro.trang-tri';
import { VaiTroNguoiDung } from '../../dung-chung/liet-ke/vai-tro-nguoi-dung.enum';

@ApiTags('customers')
@ApiBearerAuth()
@UseGuards(BaoVeJwt, BaoVeVaiTro)
@Controller('customers')
export class DieuKhienKhachHang {
  constructor(private readonly dichVuKhachHang: DichVuKhachHang) {}

  @Post()
  @VaiTro(VaiTroNguoiDung.ADMIN)
  @ApiOperation({ summary: 'Create new customer (Admin only)' })
  @ApiResponse({ status: 201, description: 'Customer created successfully' })
  create(@Body() createDto: TaoKhachHangDto) {
    return this.dichVuKhachHang.tao(createDto);
  }

  @Get()
  @VaiTro(VaiTroNguoiDung.ADMIN)
  @ApiOperation({ summary: 'Get all customers (Admin only)' })
  @ApiResponse({ status: 200, description: 'Return all customers' })
  findAll() {
    return this.dichVuKhachHang.findAll();
  }

  @Get(':id')
  @VaiTro(VaiTroNguoiDung.ADMIN)
  @ApiOperation({ summary: 'Get customer by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Return customer' })
  findOne(@Param('id') id: string) {
    return this.dichVuKhachHang.timTheoId(id);
  }

  @Patch(':id')
  @VaiTro(VaiTroNguoiDung.ADMIN)
  @ApiOperation({ summary: 'Update customer (Admin only)' })
  @ApiResponse({ status: 200, description: 'Customer updated successfully' })
  update(
    @Param('id') id: string,
    @Body() updateDto: CapNhatKhachHangDto,
  ) {
    return this.dichVuKhachHang.capNhat(id, updateDto);
  }

  @Post('sync-from-orders')
  @VaiTro(VaiTroNguoiDung.ADMIN)
  @ApiOperation({ summary: 'Sync customers from existing orders (Admin only)' })
  @ApiResponse({ status: 200, description: 'Customers synced successfully' })
  async syncFromOrders() {
    const result = await this.dichVuKhachHang.dongBoTuTatCaDonHang();
    return {
      message: `Đã đồng bộ ${result.created} khách hàng mới và cập nhật ${result.updated} khách hàng`,
      created: result.created,
      updated: result.updated,
    };
  }
}
