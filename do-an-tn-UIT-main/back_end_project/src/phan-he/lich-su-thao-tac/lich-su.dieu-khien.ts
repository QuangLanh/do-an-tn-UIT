import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DichVuLichSuThaoTac } from './lich-su.dich-vu';
import { BaoVeJwt } from '../../dung-chung/bao-ve/bao-ve-jwt';
import { BaoVeVaiTro } from '../../dung-chung/bao-ve/bao-ve-vai-tro';
import { VaiTro } from '../../dung-chung/trang-tri/vai-tro.trang-tri';
import { VaiTroNguoiDung } from '../../dung-chung/liet-ke/vai-tro-nguoi-dung.enum';

@ApiTags('audit-logs')
@ApiBearerAuth()
@UseGuards(BaoVeJwt, BaoVeVaiTro)
@Controller('audit-logs')
export class DieuKhienLichSuThaoTac {
  constructor(private readonly lichSuDichVu: DichVuLichSuThaoTac) {}

  @Get()
  @VaiTro(VaiTroNguoiDung.ADMIN, VaiTroNguoiDung.STAFF)
  @ApiOperation({ summary: 'Lấy danh sách lịch sử thao tác' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách lịch sử' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'entityType', required: false, type: String })
  @ApiQuery({ name: 'action', required: false, type: String })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('entityType') entityType?: string,
    @Query('action') action?: string,
  ) {
    return this.lichSuDichVu.findAll({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      entityType,
      action,
    });
  }
}
