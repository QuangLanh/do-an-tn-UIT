import { Controller, Post, Body, Get, Put, Patch, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DichVuXacThuc } from './xac-thuc.dich-vu';
import { DangKyDto } from './dto/dang-ky.dto';
import { DangNhapDto } from './dto/dang-nhap.dto';
import { DangNhapKhachHangDto } from './dto/dang-nhap-khach-hang.dto';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { CapNhatProfileDto } from './dto/cap-nhat-profile.dto';
import { CapNhatProfileNhanVienDto } from './dto/cap-nhat-profile-nhan-vien.dto';
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

  @Post('customer/login')
  @ApiOperation({ summary: 'Đăng nhập khách hàng bằng số điện thoại (deprecated - use OTP)' })
  @ApiResponse({ status: 200, description: 'Customer logged in successfully' })
  dangNhapKhachHang(@Body() dto: DangNhapKhachHangDto) {
    return this.dichVuXacThuc.dangNhapKhachHang(dto);
  }

  @Post('customer/request-otp')
  @ApiOperation({ summary: 'Yêu cầu mã OTP để đăng nhập' })
  @ApiResponse({ status: 200, description: 'OTP sent successfully' })
  requestOtp(@Body() dto: RequestOtpDto) {
    return this.dichVuXacThuc.requestOtp(dto);
  }

  @Post('customer/verify-otp')
  @ApiOperation({ summary: 'Xác thực OTP và đăng nhập khách hàng' })
  @ApiResponse({ status: 200, description: 'OTP verified and customer logged in successfully' })
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.dichVuXacThuc.verifyOtp(dto);
  }

  @Get('customer/me')
  @UseGuards(BaoVeJwt, BaoVeVaiTro)
  @VaiTro(VaiTroNguoiDung.CUSTOMER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy thông tin khách hàng hiện tại' })
  @ApiResponse({ status: 200, description: 'Return current customer profile' })
  thongTinKhachHang(@NguoiDungHienTai() user: any) {
    return this.dichVuXacThuc.layThongTinKhachHang(user.id);
  }

  @Put('customer/profile')
  @UseGuards(BaoVeJwt, BaoVeVaiTro)
  @VaiTro(VaiTroNguoiDung.CUSTOMER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật thông tin khách hàng' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  capNhatProfile(@NguoiDungHienTai() user: any, @Body() dto: CapNhatProfileDto) {
    return this.dichVuXacThuc.capNhatProfile(user.id, dto);
  }

  @Get('profile')
  @UseGuards(BaoVeJwt)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Return current user profile' })
  getProfile(@NguoiDungHienTai() user: any) {
    return user;
  }

  @Put('profile')
  @UseGuards(BaoVeJwt, BaoVeVaiTro)
  @VaiTro(VaiTroNguoiDung.ADMIN, VaiTroNguoiDung.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật thông tin cá nhân (Admin/Staff) - PUT' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  capNhatProfileNhanVienPut(
    @NguoiDungHienTai() user: any,
    @Body() dto: CapNhatProfileNhanVienDto,
  ) {
    return this.dichVuXacThuc.capNhatProfileNhanVien(user.id, dto);
  }

  @Patch('profile')
  @UseGuards(BaoVeJwt, BaoVeVaiTro)
  @VaiTro(VaiTroNguoiDung.ADMIN, VaiTroNguoiDung.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật thông tin cá nhân (Admin/Staff) - PATCH' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  capNhatProfileNhanVienPatch(
    @NguoiDungHienTai() user: any,
    @Body() dto: CapNhatProfileNhanVienDto,
  ) {
    return this.dichVuXacThuc.capNhatProfileNhanVien(user.id, dto);
  }
}

