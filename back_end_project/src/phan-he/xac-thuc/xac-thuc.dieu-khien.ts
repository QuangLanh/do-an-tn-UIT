import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DichVuXacThuc } from './xac-thuc.dich-vu';
import { DangKyDto } from './dto/dang-ky.dto';
import { DangNhapDto } from './dto/dang-nhap.dto';
import { BaoVeJwt } from '../../dung-chung/bao-ve/bao-ve-jwt';
import { BaoVeVaiTro } from '../../dung-chung/bao-ve/bao-ve-vai-tro';
import { VaiTro } from '../../dung-chung/trang-tri/vai-tro.trang-tri';
import { VaiTroNguoiDung } from '../../dung-chung/liet-ke/vai-tro-nguoi-dung.enum';
import { NguoiDungHienTai } from '../../dung-chung/trang-tri/nguoi-dung-hien-tai.trang-tri';

@ApiTags('xac-thuc')
@Controller('auth')
export class DieuKhienXacThuc {
  constructor(private readonly dichVuXacThuc: DichVuXacThuc) {}

  @Post('register')
  @UseGuards(BaoVeJwt, BaoVeVaiTro)
  @VaiTro(VaiTroNguoiDung.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register new user (Admin only)' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  register(@Body() registerDto: DangKyDto) {
    return this.dichVuXacThuc.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'User logged in successfully' })
  login(@Body() loginDto: DangNhapDto) {
    return this.dichVuXacThuc.login(loginDto);
  }

  @Get('profile')
  @UseGuards(BaoVeJwt)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Return current user profile' })
  getProfile(@NguoiDungHienTai() user: any) {
    return user;
  }
}

