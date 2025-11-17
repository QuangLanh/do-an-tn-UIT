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
import { DichVuSanPham } from './san-pham.dich-vu';
import { TaoSanPhamDto } from './dto/tao-san-pham.dto';
import { CapNhatSanPhamDto } from './dto/cap-nhat-san-pham.dto';
import { CapNhatTonKhoDto } from './dto/cap-nhat-ton-kho.dto';
import { BaoVeJwt } from '../../dung-chung/bao-ve/bao-ve-jwt';
import { BaoVeVaiTro } from '../../dung-chung/bao-ve/bao-ve-vai-tro';
import { VaiTro } from '../../dung-chung/trang-tri/vai-tro.trang-tri';
import { VaiTroNguoiDung } from '../../dung-chung/liet-ke/vai-tro-nguoi-dung.enum';

@ApiTags('san-pham')
@ApiBearerAuth()
@UseGuards(BaoVeJwt, BaoVeVaiTro)
@Controller('products')
export class DieuKhienSanPham {
  constructor(private readonly dichVuSanPham: DichVuSanPham) {}

  @Post()
  @VaiTro(VaiTroNguoiDung.ADMIN, VaiTroNguoiDung.MANAGER)
  @ApiOperation({ summary: 'Create new product (Admin, Manager)' })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  create(@Body() createProductDto: TaoSanPhamDto) {
    return this.dichVuSanPham.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products (All roles)' })
  @ApiResponse({ status: 200, description: 'Return all products' })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'lowStock', required: false, type: Boolean })
  findAll(@Query() query: any) {
    return this.dichVuSanPham.findAll(query);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get all product categories' })
  @ApiResponse({ status: 200, description: 'Return all categories' })
  getCategories() {
    return this.dichVuSanPham.getCategories();
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Get products with low stock' })
  @ApiResponse({ status: 200, description: 'Return low stock products' })
  getLowStockProducts() {
    return this.dichVuSanPham.getLowStockProducts();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiResponse({ status: 200, description: 'Return product' })
  findOne(@Param('id') id: string) {
    return this.dichVuSanPham.findOne(id);
  }

  @Patch(':id')
  @VaiTro(VaiTroNguoiDung.ADMIN, VaiTroNguoiDung.MANAGER)
  @ApiOperation({ summary: 'Update product (Admin, Manager)' })
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  update(
    @Param('id') id: string,
    @Body() updateProductDto: CapNhatSanPhamDto,
  ) {
    return this.dichVuSanPham.update(id, updateProductDto);
  }

  @Patch(':id/stock')
  @VaiTro(VaiTroNguoiDung.ADMIN, VaiTroNguoiDung.MANAGER)
  @ApiOperation({ summary: 'Update product stock (Admin, Manager)' })
  @ApiResponse({ status: 200, description: 'Stock updated successfully' })
  updateStock(
    @Param('id') id: string,
    @Body() updateStockDto: CapNhatTonKhoDto,
  ) {
    return this.dichVuSanPham.updateStock(id, updateStockDto);
  }

  @Delete(':id')
  @VaiTro(VaiTroNguoiDung.ADMIN)
  @ApiOperation({ summary: 'Delete product' })
  @ApiResponse({ status: 200, description: 'Product deleted successfully' })
  remove(@Param('id') id: string) {
    return this.dichVuSanPham.remove(id);
  }
}

