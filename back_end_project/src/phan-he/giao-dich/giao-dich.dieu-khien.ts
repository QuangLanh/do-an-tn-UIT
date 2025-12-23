import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { DichVuGiaoDich } from './giao-dich.dich-vu';
import { BaoVeJwt } from '../../dung-chung/bao-ve/bao-ve-jwt';
import { BaoVeVaiTro } from '../../dung-chung/bao-ve/bao-ve-vai-tro';
import { VaiTro } from '../../dung-chung/trang-tri/vai-tro.trang-tri';
import { VaiTroNguoiDung } from '../../dung-chung/liet-ke/vai-tro-nguoi-dung.enum';

@ApiTags('giao-dich')
@ApiBearerAuth()
@UseGuards(BaoVeJwt, BaoVeVaiTro)
@Controller('transactions')
export class DieuKhienGiaoDich {
  constructor(private readonly dichVuGiaoDich: DichVuGiaoDich) {}

  @Get('summary')
  @VaiTro(VaiTroNguoiDung.ADMIN, VaiTroNguoiDung.STAFF)
  @ApiOperation({
    summary: 'Get transaction summary (Admin, Manager, Accountant)',
  })
  @ApiResponse({ status: 200, description: 'Return transaction summary' })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  getSummary(@Query('from') from?: string, @Query('to') to?: string) {
    const fromDate = from ? new Date(from) : undefined;
    const toDate = to ? new Date(to) : undefined;
    return this.dichVuGiaoDich.getSummary(fromDate, toDate);
  }

  @Get('monthly')
  @VaiTro(VaiTroNguoiDung.ADMIN, VaiTroNguoiDung.STAFF)
  @ApiOperation({
    summary: 'Get monthly transaction data (Admin, Manager, Accountant)',
  })
  @ApiResponse({ status: 200, description: 'Return monthly data' })
  @ApiQuery({ name: 'year', required: false, type: Number })
  getMonthlyData(@Query('year') year?: number) {
    return this.dichVuGiaoDich.getMonthlyData(year ? +year : undefined);
  }
}

