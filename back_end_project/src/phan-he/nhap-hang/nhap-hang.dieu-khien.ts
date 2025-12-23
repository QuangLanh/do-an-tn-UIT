import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { DichVuNhapHang } from './nhap-hang.dich-vu';
import { DichVuGoiYNhapHang } from './goi-y-nhap-hang.dich-vu';
import { TaoNhapHangDto } from './dto/tao-nhap-hang.dto';
import { BaoVeJwt } from '../../dung-chung/bao-ve/bao-ve-jwt';
import { BaoVeVaiTro } from '../../dung-chung/bao-ve/bao-ve-vai-tro';
import { VaiTro } from '../../dung-chung/trang-tri/vai-tro.trang-tri';
import { NguoiDungHienTai } from '../../dung-chung/trang-tri/nguoi-dung-hien-tai.trang-tri';
import { VaiTroNguoiDung } from '../../dung-chung/liet-ke/vai-tro-nguoi-dung.enum';

@ApiTags('nhap-hang')
@ApiBearerAuth()
@UseGuards(BaoVeJwt, BaoVeVaiTro)
@Controller('purchases')
export class DieuKhienNhapHang {
  constructor(
    private readonly dichVuNhapHang: DichVuNhapHang,
    private readonly recommendationService: DichVuGoiYNhapHang,
  ) {}

  @Post()
  @VaiTro(VaiTroNguoiDung.ADMIN, VaiTroNguoiDung.STAFF)
  @ApiOperation({ summary: 'Create new purchase (Admin, Manager)' })
  @ApiResponse({ status: 201, description: 'Purchase created successfully' })
  create(
    @Body() createPurchaseDto: TaoNhapHangDto,
    @NguoiDungHienTai('id') userId: string,
  ) {
    return this.dichVuNhapHang.create(createPurchaseDto, userId);
  }

  @Get()
  @VaiTro(VaiTroNguoiDung.ADMIN, VaiTroNguoiDung.STAFF)
  @ApiOperation({ summary: 'Get all purchases (Admin, Manager, Accountant)' })
  @ApiResponse({ status: 200, description: 'Return all purchases' })
  @ApiQuery({ name: 'supplier', required: false })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  findAll(@Query() query: any) {
    return this.dichVuNhapHang.findAll(query);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get purchase statistics' })
  @ApiResponse({ status: 200, description: 'Return purchase statistics' })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  getStatistics(@Query('from') from?: string, @Query('to') to?: string) {
    const fromDate = from ? new Date(from) : undefined;
    const toDate = to ? new Date(to) : undefined;
    return this.dichVuNhapHang.getStatistics(fromDate, toDate);
  }

  @Get('suppliers')
  @ApiOperation({ summary: 'Get all suppliers' })
  @ApiResponse({ status: 200, description: 'Return all suppliers' })
  getSuppliers() {
    return this.dichVuNhapHang.getSuppliers();
  }

  @Get('recommendations')
  @VaiTro(VaiTroNguoiDung.ADMIN, VaiTroNguoiDung.STAFF)
  @ApiOperation({
    summary: 'Get purchase recommendations based on sales data (Admin, Manager)',
  })
  @ApiResponse({
    status: 200,
    description: 'Return purchase recommendations with priority levels',
  })
  getRecommendations() {
    return this.recommendationService.getRecommendations();
  }

  @Get('recommendations/high-priority')
  @VaiTro(VaiTroNguoiDung.ADMIN, VaiTroNguoiDung.STAFF)
  @ApiOperation({
    summary: 'Get high priority purchase recommendations (Admin, Manager)',
  })
  @ApiResponse({
    status: 200,
    description: 'Return products that need urgent restocking',
  })
  getHighPriorityRecommendations() {
    return this.recommendationService.getHighPriorityRecommendations();
  }

  @Get('recommendations/low-priority')
  @VaiTro(VaiTroNguoiDung.ADMIN, VaiTroNguoiDung.STAFF)
  @ApiOperation({
    summary: 'Get low priority purchase recommendations (Admin, Manager)',
  })
  @ApiResponse({
    status: 200,
    description: 'Return products that should purchase less (slow sellers)',
  })
  getLowPriorityRecommendations() {
    return this.recommendationService.getLowPriorityRecommendations();
  }

  @Get(':id')
  @VaiTro(VaiTroNguoiDung.ADMIN, VaiTroNguoiDung.STAFF)
  @ApiOperation({ summary: 'Get purchase by ID (Admin, Manager, Accountant)' })
  @ApiResponse({ status: 200, description: 'Return purchase' })
  findOne(@Param('id') id: string) {
    return this.dichVuNhapHang.findOne(id);
  }

  @Patch(':id')
  @VaiTro(VaiTroNguoiDung.ADMIN)
  @ApiOperation({ summary: 'Update purchase (Admin only)' })
  @ApiResponse({ status: 200, description: 'Purchase updated successfully' })
  update(@Param('id') id: string, @Body() updateData: any) {
    return this.dichVuNhapHang.update(id, updateData);
  }

  @Delete(':id')
  @VaiTro(VaiTroNguoiDung.ADMIN)
  @ApiOperation({ summary: 'Delete purchase (Admin only)' })
  @ApiResponse({ status: 200, description: 'Purchase deleted successfully' })
  remove(@Param('id') id: string) {
    return this.dichVuNhapHang.remove(id);
  }
}

