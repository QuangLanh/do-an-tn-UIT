import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DichVuNguoiDung } from './nguoi-dung.dich-vu';
import { TaoNguoiDungDto } from './dto/tao-nguoi-dung.dto';
import { CapNhatNguoiDungDto } from './dto/cap-nhat-nguoi-dung.dto';
import { BaoVeJwt } from '../../dung-chung/bao-ve/bao-ve-jwt';
import { BaoVeVaiTro } from '../../dung-chung/bao-ve/bao-ve-vai-tro';
import { VaiTro } from '../../dung-chung/trang-tri/vai-tro.trang-tri';
import { VaiTroNguoiDung } from '../../dung-chung/liet-ke/vai-tro-nguoi-dung.enum';

@ApiTags('nguoi-dung')
@ApiBearerAuth()
@UseGuards(BaoVeJwt, BaoVeVaiTro)
@Controller('users')
export class DieuKhienNguoiDung {
  constructor(private readonly dichVuNguoiDung: DichVuNguoiDung) {}

  @Post()
  @VaiTro(VaiTroNguoiDung.ADMIN)
  @ApiOperation({ summary: 'Create new user (Admin only)' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  create(@Body() createUserDto: TaoNguoiDungDto) {
    return this.dichVuNguoiDung.create(createUserDto);
  }

  @Get()
  @VaiTro(VaiTroNguoiDung.ADMIN, VaiTroNguoiDung.MANAGER)
  @ApiOperation({ summary: 'Get all users (Admin, Manager)' })
  @ApiResponse({ status: 200, description: 'Return all users' })
  findAll() {
    return this.dichVuNguoiDung.findAll();
  }

  @Get(':id')
  @VaiTro(VaiTroNguoiDung.ADMIN)
  @ApiOperation({ summary: 'Get user by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Return user' })
  findOne(@Param('id') id: string) {
    return this.dichVuNguoiDung.findOne(id);
  }

  @Patch(':id')
  @VaiTro(VaiTroNguoiDung.ADMIN)
  @ApiOperation({ summary: 'Update user (Admin only)' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  update(
    @Param('id') id: string,
    @Body() updateUserDto: CapNhatNguoiDungDto,
  ) {
    return this.dichVuNguoiDung.update(id, updateUserDto);
  }

  @Delete(':id')
  @VaiTro(VaiTroNguoiDung.ADMIN)
  @ApiOperation({ summary: 'Delete user (Admin only)' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  remove(@Param('id') id: string) {
    return this.dichVuNguoiDung.remove(id);
  }
}

