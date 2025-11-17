import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { Response } from 'express';
import { DichVuBaoCao } from './bao-cao.dich-vu';
import { DichVuGiaoDich } from '../giao-dich/giao-dich.dich-vu';
import { BaoVeJwt } from '../../dung-chung/bao-ve/bao-ve-jwt';
import { BaoVeVaiTro } from '../../dung-chung/bao-ve/bao-ve-vai-tro';
import { VaiTro } from '../../dung-chung/trang-tri/vai-tro.trang-tri';
import { VaiTroNguoiDung } from '../../dung-chung/liet-ke/vai-tro-nguoi-dung.enum';

@ApiTags('bao-cao')
@ApiBearerAuth()
@UseGuards(BaoVeJwt, BaoVeVaiTro)
@Controller('reports')
export class DieuKhienBaoCao {
  constructor(
    private readonly dichVuBaoCao: DichVuBaoCao,
    private readonly dichVuGiaoDich: DichVuGiaoDich,
  ) {}

  @Get('summary')
  @VaiTro(VaiTroNguoiDung.ADMIN, VaiTroNguoiDung.MANAGER, VaiTroNguoiDung.ACCOUNTANT)
  @ApiOperation({ summary: 'Get report summary (Admin, Manager, Accountant)' })
  @ApiResponse({ status: 200, description: 'Return report summary' })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  getSummary(@Query('from') from?: string, @Query('to') to?: string) {
    const fromDate = from ? new Date(from) : undefined;
    const toDate = to ? new Date(to) : undefined;
    return this.dichVuBaoCao.getRevenueReport(fromDate, toDate);
  }

  @Get('revenue')
  @VaiTro(VaiTroNguoiDung.ADMIN, VaiTroNguoiDung.MANAGER, VaiTroNguoiDung.ACCOUNTANT)
  @ApiOperation({ summary: 'Get revenue report (Admin, Manager, Accountant)' })
  @ApiResponse({ status: 200, description: 'Return revenue report' })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  getRevenueReport(@Query('from') from?: string, @Query('to') to?: string) {
    const fromDate = from ? new Date(from) : undefined;
    const toDate = to ? new Date(to) : undefined;
    return this.dichVuBaoCao.getRevenueReport(fromDate, toDate);
  }

  @Get('profit')
  @VaiTro(VaiTroNguoiDung.ADMIN, VaiTroNguoiDung.MANAGER, VaiTroNguoiDung.ACCOUNTANT)
  @ApiOperation({ summary: 'Get profit report (Admin, Manager, Accountant)' })
  @ApiResponse({ status: 200, description: 'Return profit report' })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  async getProfitReport(@Query('from') from?: string, @Query('to') to?: string) {
    const fromDate = from ? new Date(from) : undefined;
    const toDate = to ? new Date(to) : undefined;
    const summary = await this.dichVuGiaoDich.getSummary(fromDate, toDate);
    return {
      revenue: summary.revenue,
      cost: summary.cost,
      profit: summary.profit,
      profitMargin: summary.profitMargin,
      generatedAt: new Date().toISOString(),
    };
  }

  @Get('export')
  @VaiTro(VaiTroNguoiDung.ADMIN, VaiTroNguoiDung.ACCOUNTANT)
  @ApiOperation({ summary: 'Export revenue report as PDF (Admin, Accountant)' })
  @ApiResponse({ status: 200, description: 'Return PDF file' })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  async exportRevenuePDF(
    @Res() res: Response,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const fromDate = from ? new Date(from) : undefined;
    const toDate = to ? new Date(to) : undefined;
    return this.dichVuBaoCao.exportRevenuePDF(res, fromDate, toDate);
  }

  @Get('inventory')
  @VaiTro(VaiTroNguoiDung.ADMIN, VaiTroNguoiDung.MANAGER, VaiTroNguoiDung.ACCOUNTANT)
  @ApiOperation({ summary: 'Get inventory report (Admin, Manager, Accountant)' })
  @ApiResponse({ status: 200, description: 'Return inventory report' })
  getInventoryReport() {
    return this.dichVuBaoCao.getInventoryReport();
  }
}

