import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { DichVuBangDieuKhien } from './bang-dieu-khien.dich-vu';
import { BaoVeJwt } from '../../dung-chung/bao-ve/bao-ve-jwt';
import { BaoVeVaiTro } from '../../dung-chung/bao-ve/bao-ve-vai-tro';
import { VaiTro } from '../../dung-chung/trang-tri/vai-tro.trang-tri';
import { VaiTroNguoiDung } from '../../dung-chung/liet-ke/vai-tro-nguoi-dung.enum';

@ApiTags('bang-dieu-khien')
@ApiBearerAuth()
@UseGuards(BaoVeJwt, BaoVeVaiTro)
@Controller('dashboard')
export class DieuKhienBangDieuKhien {
  constructor(private readonly bangDieuKhienDichVu: DichVuBangDieuKhien) {}

  @Get('summary')
  @VaiTro(VaiTroNguoiDung.ADMIN, VaiTroNguoiDung.STAFF)
  @ApiOperation({ summary: 'Get dashboard overview (Admin, Manager, Accountant)' })
  @ApiResponse({ status: 200, description: 'Return dashboard summary' })
  getSummary() {
    return this.bangDieuKhienDichVu.getSummary();
  }

  @Get('overview')
  @VaiTro(VaiTroNguoiDung.ADMIN, VaiTroNguoiDung.STAFF)
  @ApiOperation({ summary: 'Get dashboard overview (Admin, Manager, Accountant)' })
  @ApiResponse({ status: 200, description: 'Return dashboard overview' })
  getOverview() {
    return this.bangDieuKhienDichVu.getSummary();
  }

  @Get('top-products')
  @VaiTro(VaiTroNguoiDung.ADMIN, VaiTroNguoiDung.STAFF)
  @ApiOperation({ summary: 'Get top products (Admin, Manager, Accountant)' })
  @ApiResponse({ status: 200, description: 'Return top products' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getTopProducts(@Query('limit') limit?: number) {
    return this.bangDieuKhienDichVu.getTopProducts(limit ? +limit : 10);
  }

  @Get('orders-trend')
  @VaiTro(VaiTroNguoiDung.ADMIN, VaiTroNguoiDung.STAFF)
  @ApiOperation({ summary: 'Get orders trend (Admin, Manager, Accountant)' })
  @ApiResponse({ status: 200, description: 'Return orders trend' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  getOrdersTrend(@Query('days') days?: number) {
    return this.bangDieuKhienDichVu.getOrdersTrend(days ? +days : 30);
  }

  @Get('recent-activity')
  @VaiTro(VaiTroNguoiDung.ADMIN, VaiTroNguoiDung.STAFF)
  @ApiOperation({ summary: 'Get recent activity (Admin, Manager, Accountant)' })
  @ApiResponse({ status: 200, description: 'Return recent activity' })
  getRecentActivity() {
    return this.bangDieuKhienDichVu.getRecentActivity();
  }
}

