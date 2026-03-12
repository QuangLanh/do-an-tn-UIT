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
import { DichVuStockBatch } from './stock-batch.dich-vu';
import { DichVuGoiYNhapHang } from './goi-y-nhap-hang.dich-vu';
import { TaoNhapHangDto } from './dto/tao-nhap-hang.dto';
import { NhanHangDto } from './dto/nhan-hang.dto';
import { LoaiBoHetHanDto } from './dto/loai-bo-het-han.dto';
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
    private readonly dichVuStockBatch: DichVuStockBatch,
    private readonly recommendationService: DichVuGoiYNhapHang,
  ) {}

  @Post()
  @VaiTro(VaiTroNguoiDung.ADMIN, VaiTroNguoiDung.STAFF)
  @ApiOperation({ summary: 'Create new purchase (Admin, Manager)' })
  @ApiResponse({ status: 201, description: 'Purchase created successfully' })
  create(
    @Body() createPurchaseDto: TaoNhapHangDto,
    @NguoiDungHienTai('id') userId: string,
    @NguoiDungHienTai('fullName') userFullName: string,
  ) {
    return this.dichVuNhapHang.create(createPurchaseDto, userId, userFullName || 'Nhân viên');
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

  @Get('price-history/:productId')
  @VaiTro(VaiTroNguoiDung.ADMIN, VaiTroNguoiDung.STAFF)
  @ApiOperation({ summary: 'Get import price history for a product' })
  @ApiResponse({ status: 200, description: 'Return price history' })
  getPriceHistory(@Param('productId') productId: string) {
    return this.dichVuNhapHang.getPriceHistory(productId);
  }

  @Get('expiry-warnings')
  @VaiTro(VaiTroNguoiDung.ADMIN, VaiTroNguoiDung.STAFF)
  @ApiOperation({ summary: 'Get products with expiry warnings (expired & expiring soon)' })
  @ApiResponse({ status: 200, description: 'Return expiry warnings' })
  @ApiQuery({ name: 'days', required: false, type: Number, description: 'Days threshold for "expiring soon" (default: 7)' })
  getExpiryWarnings(@Query('days') days?: string) {
    return this.dichVuNhapHang.getExpiryWarnings(days ? parseInt(days, 10) : 7);
  }

  @Get('batches/product/:productId')
  @VaiTro(VaiTroNguoiDung.ADMIN, VaiTroNguoiDung.STAFF)
  @ApiOperation({ summary: 'Get stock batches for a product (inventory detail)' })
  @ApiResponse({ status: 200, description: 'Return batches with expiry status' })
  getProductBatches(@Param('productId') productId: string) {
    return this.dichVuStockBatch.getBatchesByProduct(productId);
  }

  @Get('expiry-status')
  @VaiTro(VaiTroNguoiDung.ADMIN, VaiTroNguoiDung.STAFF)
  @ApiOperation({ summary: 'Get expiry status per product (expired, near_expiry, normal)' })
  @ApiResponse({ status: 200, description: 'Return productId -> { status, expiredQty, nearExpiryQty }' })
  @ApiQuery({ name: 'days', required: false, type: Number, description: 'Days for near expiry (default: 7)' })
  getExpiryStatus(@Query('days') days?: string) {
    return this.dichVuNhapHang.getProductExpiryStatusMap(days ? parseInt(days, 10) : 7);
  }

  @Post('remove-expired')
  @VaiTro(VaiTroNguoiDung.ADMIN, VaiTroNguoiDung.STAFF)
  @ApiOperation({ summary: 'Remove expired stock for a product' })
  @ApiResponse({ status: 200, description: 'Expired quantity removed from stock' })
  removeExpiredStock(
    @Body() dto: LoaiBoHetHanDto,
    @NguoiDungHienTai('id') userId: string,
    @NguoiDungHienTai('fullName') userFullName: string,
  ) {
    return this.dichVuNhapHang.removeExpiredStock(dto.productId, userId, userFullName || 'Nhân viên');
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

  @Patch(':id/receive')
  @VaiTro(VaiTroNguoiDung.ADMIN, VaiTroNguoiDung.STAFF)
  @ApiOperation({ summary: 'Receive goods checklist and update stock' })
  @ApiResponse({ status: 200, description: 'Purchase received successfully' })
  receiveGoods(
    @Param('id') id: string,
    @Body() receiveDto: NhanHangDto,
    @NguoiDungHienTai('id') userId: string,
    @NguoiDungHienTai('fullName') userFullName: string,
  ) {
    return this.dichVuNhapHang.receiveGoods(id, receiveDto, userId, userFullName || 'Nhân viên');
  }

  @Delete(':id')
  @VaiTro(VaiTroNguoiDung.ADMIN)
  @ApiOperation({ summary: 'Delete purchase (Admin only)' })
  @ApiResponse({ status: 200, description: 'Purchase deleted successfully' })
  remove(
    @Param('id') id: string,
    @NguoiDungHienTai('id') userId: string,
    @NguoiDungHienTai('fullName') userFullName: string,
  ) {
    return this.dichVuNhapHang.remove(id, userId, userFullName || 'Nhân viên');
  }
}

