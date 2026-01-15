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
import { DichVuDonHang } from './don-hang.dich-vu';
import { TaoDonHangDto } from './dto/tao-don-hang.dto';
import { CapNhatTrangThaiDonHangDto } from './dto/cap-nhat-trang-thai-don-hang.dto';
import { BaoVeJwt } from '../../dung-chung/bao-ve/bao-ve-jwt';
import { BaoVeVaiTro } from '../../dung-chung/bao-ve/bao-ve-vai-tro';
import { VaiTro } from '../../dung-chung/trang-tri/vai-tro.trang-tri';
import { NguoiDungHienTai } from '../../dung-chung/trang-tri/nguoi-dung-hien-tai.trang-tri';
import { VaiTroNguoiDung } from '../../dung-chung/liet-ke/vai-tro-nguoi-dung.enum';

@ApiTags('don-hang')
@ApiBearerAuth()
@UseGuards(BaoVeJwt, BaoVeVaiTro)
@Controller('orders')
export class DieuKhienDonHang {
  constructor(private readonly dichVuDonHang: DichVuDonHang) {}

  @Post()
  @VaiTro(VaiTroNguoiDung.STAFF, VaiTroNguoiDung.ADMIN)
  @ApiOperation({ summary: 'Create new order (Staff, Admin)' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  create(
    @Body() createOrderDto: TaoDonHangDto,
    @NguoiDungHienTai('id') userId: string,
  ) {
    return this.dichVuDonHang.create(createOrderDto, userId);
  }

  @Get()
  @VaiTro(
    VaiTroNguoiDung.ADMIN,
    VaiTroNguoiDung.STAFF,
  )
  @ApiOperation({ summary: 'Get all orders (Admin, Staff)' })
  @ApiResponse({ status: 200, description: 'Return all orders' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  findAll(@Query() query: any) {
    return this.dichVuDonHang.findAll(query);
  }

  @Get('debts')
  @VaiTro(VaiTroNguoiDung.ADMIN, VaiTroNguoiDung.STAFF)
  @ApiOperation({ summary: 'Get all debt orders (Admin, Staff)' })
  @ApiResponse({ status: 200, description: 'Return all debt orders' })
  findDebts() {
    return this.dichVuDonHang.findDebts();
  }

  @Get('history')
  @VaiTro(VaiTroNguoiDung.CUSTOMER)
  @ApiOperation({ summary: 'Lịch sử mua hàng của khách (Customer - read only)' })
  @ApiResponse({ status: 200, description: 'Return order history for current customer' })
  layLichSuMuaHang(@NguoiDungHienTai('soDienThoai') soDienThoai: string) {
    return this.dichVuDonHang.layLichSuMuaHangTheoSoDienThoai(soDienThoai);
  }

  @Get('statistics')
  @VaiTro(VaiTroNguoiDung.ADMIN, VaiTroNguoiDung.STAFF)
  @ApiOperation({ summary: 'Get order statistics' })
  @ApiResponse({ status: 200, description: 'Return order statistics' })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  getStatistics(@Query('from') from?: string, @Query('to') to?: string) {
    const fromDate = from ? new Date(from) : undefined;
    const toDate = to ? new Date(to) : undefined;
    return this.dichVuDonHang.getStatistics(fromDate, toDate);
  }

  @Get('top-products')
  @VaiTro(VaiTroNguoiDung.ADMIN, VaiTroNguoiDung.STAFF)
  @ApiOperation({ summary: 'Get top selling products' })
  @ApiResponse({ status: 200, description: 'Return top products' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getTopProducts(@Query('limit') limit?: number) {
    return this.dichVuDonHang.getTopProducts(limit ? +limit : 10);
  }

  @Get(':id')
  @VaiTro(VaiTroNguoiDung.ADMIN, VaiTroNguoiDung.STAFF)
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiResponse({ status: 200, description: 'Return order' })
  findOne(@Param('id') id: string) {
    return this.dichVuDonHang.findOne(id);
  }

  @Patch(':id/status')
  @VaiTro(VaiTroNguoiDung.ADMIN)
  @ApiOperation({ summary: 'Update order status (Admin only)' })
  @ApiResponse({ status: 200, description: 'Order status updated successfully' })
  updateStatus(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: CapNhatTrangThaiDonHangDto,
  ) {
    return this.dichVuDonHang.updateStatus(id, updateOrderStatusDto);
  }

  @Patch(':id/pay-debt')
  @VaiTro(VaiTroNguoiDung.ADMIN, VaiTroNguoiDung.STAFF)
  @ApiOperation({ summary: 'Pay debt for an order (Admin, Staff)' })
  @ApiResponse({ status: 200, description: 'Debt paid successfully' })
  payDebt(@Param('id') id: string) {
    return this.dichVuDonHang.payDebt(id);
  }

  @Delete(':id')
  @VaiTro(VaiTroNguoiDung.ADMIN)
  @ApiOperation({ summary: 'Delete order (Admin only)' })
  @ApiResponse({ status: 200, description: 'Order deleted successfully' })
  remove(@Param('id') id: string) {
    return this.dichVuDonHang.remove(id);
  }

  @Get(':id/invoice')
  @VaiTro(
    VaiTroNguoiDung.STAFF,
    VaiTroNguoiDung.ADMIN,
  )
  @ApiOperation({ summary: 'Get order invoice (Staff, Admin)' })
  @ApiResponse({ status: 200, description: 'Return order invoice' })
  getInvoice(@Param('id') id: string) {
    return this.dichVuDonHang.findOne(id);
  }
}

