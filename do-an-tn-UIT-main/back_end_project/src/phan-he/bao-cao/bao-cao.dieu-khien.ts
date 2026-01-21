import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { DichVuBaoCao } from './bao-cao.dich-vu';
import { BaoVeJwt } from '../../dung-chung/bao-ve/bao-ve-jwt';
import { BaoVeVaiTro } from '../../dung-chung/bao-ve/bao-ve-vai-tro';
import { VaiTro } from '../../dung-chung/trang-tri/vai-tro.trang-tri';
import { VaiTroNguoiDung } from '../../dung-chung/liet-ke/vai-tro-nguoi-dung.enum';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(BaoVeJwt, BaoVeVaiTro)
@Controller('reports')
export class DieuKhienBaoCao {
  constructor(private readonly dichVuBaoCao: DichVuBaoCao) {}

  // 1. API Báo cáo tổng quan (Dùng cho Dashboard hoặc Header báo cáo)
  @Get('summary')
  @VaiTro(VaiTroNguoiDung.ADMIN, VaiTroNguoiDung.STAFF)
  @ApiOperation({ summary: 'Get revenue report summary' })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  async getRevenueReport(
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const dateFrom = from ? new Date(from) : undefined;
    const dateTo = to ? new Date(to) : undefined;
    return this.dichVuBaoCao.getRevenueReport(dateFrom, dateTo);
  }

  // 2. API Doanh thu theo ngày (QUAN TRỌNG: Đây là cái bảng 10 ngày của bạn)
  @Get('daily-sales') 
  @VaiTro(VaiTroNguoiDung.ADMIN, VaiTroNguoiDung.STAFF)
  @ApiOperation({ summary: 'Get daily sales report (Chart data)' })
  @ApiQuery({ name: 'days', required: false, description: 'Number of days to look back (default 30)' })
  async getDailySalesReport(@Query('days') days?: number) {
    // Gọi đúng hàm getDailySalesReport trong Service (Hàm có logic fix giá vốn)
    return this.dichVuBaoCao.getDailySalesReport(days ? Number(days) : 30);
  }

  // 3. API Top sản phẩm bán chạy
  @Get('top-products')
  @VaiTro(VaiTroNguoiDung.ADMIN, VaiTroNguoiDung.STAFF)
  @ApiOperation({ summary: 'Get top selling products' })
  @ApiQuery({ name: 'limit', required: false })
  async getTopProductsReport(@Query('limit') limit?: number) {
    // Gọi đúng hàm getTopProductsReport trong Service
    return this.dichVuBaoCao.getTopProductsReport(limit ? Number(limit) : 10);
  }

  // 4. Xuất PDF
  @Get('export')
  @VaiTro(VaiTroNguoiDung.ADMIN, VaiTroNguoiDung.STAFF)
  @ApiOperation({ summary: 'Export revenue report to PDF' })
  async exportRevenuePDF(
    @Res() res: Response,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const dateFrom = from ? new Date(from) : undefined;
    const dateTo = to ? new Date(to) : undefined;
    return this.dichVuBaoCao.exportRevenuePDF(res, dateFrom, dateTo);
  }

  // 5. Báo cáo tồn kho
  @Get('inventory')
  @VaiTro(VaiTroNguoiDung.ADMIN, VaiTroNguoiDung.STAFF)
  @ApiOperation({ summary: 'Get inventory report' })
  async getInventoryReport() {
    return this.dichVuBaoCao.getInventoryReport();
  }
}