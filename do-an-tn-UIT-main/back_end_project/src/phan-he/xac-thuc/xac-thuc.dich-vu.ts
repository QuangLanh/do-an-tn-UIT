import { Injectable, UnauthorizedException, Logger, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { DichVuNguoiDung } from '../nguoi-dung/nguoi-dung.dich-vu';
import { DangKyDto } from './dto/dang-ky.dto';
import { DangNhapDto } from './dto/dang-nhap.dto';
import { DangNhapKhachHangDto } from './dto/dang-nhap-khach-hang.dto';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { CapNhatProfileDto } from './dto/cap-nhat-profile.dto';
import { CapNhatProfileNhanVienDto } from './dto/cap-nhat-profile-nhan-vien.dto';
import { JwtTaiDuLieu } from '../../dung-chung/giao-dien/jwt-payload.giao-dien';
import { VaiTroNguoiDung } from '../../dung-chung/liet-ke/vai-tro-nguoi-dung.enum';
import { UserDocument } from '../nguoi-dung/schemas/user.schema';
import { DichVuKhachHang } from '../khach-hang/khach-hang.dich-vu';
import { Otp, OtpDocument } from './schemas/otp.schema';

@Injectable()
export class DichVuXacThuc {
  private readonly logger = new Logger(DichVuXacThuc.name);

  constructor(
    private dichVuNguoiDung: DichVuNguoiDung,
    private dichVuKhachHang: DichVuKhachHang,
    private jwtService: JwtService,
    @InjectModel(Otp.name) private otpModel: Model<OtpDocument>,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.dichVuNguoiDung.findByEmail(email);

    if (!user) {
      return null;
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Tài khoản đã bị khóa');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    const { password: _, ...result } = user.toObject();
    return { ...result, _id: user._id };
  }

  async login(loginDto: DangNhapDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Sai tên đăng nhập hoặc mật khẩu. Vui lòng kiểm tra lại.');
    }

    await this.dichVuNguoiDung.updateLastLogin(user._id.toString());

    const payload: JwtTaiDuLieu = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    this.logger.log(`User logged in: ${user.email}`);

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }

  async register(registerDto: DangKyDto) {
    const user = (await this.dichVuNguoiDung.create({
      ...registerDto,
      role: VaiTroNguoiDung.STAFF,
    })) as UserDocument;

    const payload: JwtTaiDuLieu = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    this.logger.log(`User registered: ${user.email}`);

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }

  /**
   * Đăng nhập khách hàng bằng số điện thoại (OTP giả lập / login đơn giản).
   * - Không dùng mật khẩu
   * - Nếu chưa có khách hàng => tạo mới
   * @deprecated Sử dụng verifyOtp thay thế
   */
  async dangNhapKhachHang(dto: DangNhapKhachHangDto) {
    const khachHang = await this.dichVuKhachHang.taoNeuChuaCo(
      dto.soDienThoai,
      dto.ten,
    );

    if (khachHang.isActive === false) {
      throw new UnauthorizedException('Tài khoản đã bị khóa');
    }

    const payload: JwtTaiDuLieu = {
      sub: khachHang._id.toString(),
      soDienThoai: khachHang.soDienThoai,
      role: VaiTroNguoiDung.CUSTOMER,
    };

    this.logger.log(`Customer logged in: ${khachHang.soDienThoai}`);

    return {
      access_token: this.jwtService.sign(payload),
      customer: {
        id: khachHang._id,
        soDienThoai: khachHang.soDienThoai,
        ten: khachHang.ten,
        role: khachHang.role,
      },
    };
  }

  /**
   * Yêu cầu mã OTP cho số điện thoại
   */
  async requestOtp(dto: RequestOtpDto) {
    // Validate phone number: must be exactly 10 digits starting with 0
    if (!/^0\d{9}$/.test(dto.phone)) {
      throw new BadRequestException('Số điện thoại phải có đúng 10 số và bắt đầu bằng 0');
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Delete old OTPs for this phone
    await this.otpModel.deleteMany({ phone: dto.phone });

    // Create new OTP
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5); // Expires in 5 minutes

    const otp = new this.otpModel({
      phone: dto.phone,
      code: otpCode,
      expiresAt,
      used: false,
    });

    await otp.save();

    // In production, send SMS here
    // For now, log it (in development, you can check logs)
    this.logger.log(`OTP for ${dto.phone}: ${otpCode} (expires in 5 minutes)`);

    return {
      message: 'Mã OTP đã được gửi đến số điện thoại của bạn',
      // In development, return OTP for testing (remove in production)
      otp: process.env.NODE_ENV === 'development' ? otpCode : undefined,
    };
  }

  /**
   * Xác thực OTP và đăng nhập khách hàng
   */
  async verifyOtp(dto: VerifyOtpDto) {
    // Validate phone number
    if (!/^0\d{9}$/.test(dto.phone)) {
      throw new BadRequestException('Số điện thoại phải có đúng 10 số và bắt đầu bằng 0');
    }

    // Find valid OTP
    const otp = await this.otpModel.findOne({
      phone: dto.phone,
      code: dto.otp,
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!otp) {
      throw new UnauthorizedException('Mã OTP không hợp lệ hoặc đã hết hạn');
    }

    // Mark OTP as used
    otp.used = true;
    await otp.save();

    // Create or get customer
    const khachHang = await this.dichVuKhachHang.taoNeuChuaCo(
      dto.phone,
      dto.ten,
    );

    if (khachHang.isActive === false) {
      throw new UnauthorizedException('Tài khoản đã bị khóa');
    }

    // Generate JWT token
    const payload: JwtTaiDuLieu = {
      sub: khachHang._id.toString(),
      soDienThoai: khachHang.soDienThoai,
      role: VaiTroNguoiDung.CUSTOMER,
    };

    this.logger.log(`Customer logged in with OTP: ${khachHang.soDienThoai}`);

    return {
      access_token: this.jwtService.sign(payload),
      customer: {
        id: khachHang._id,
        soDienThoai: khachHang.soDienThoai,
        ten: khachHang.ten,
        role: khachHang.role,
      },
    };
  }

  /**
   * Lấy thông tin khách hàng theo ID
   */
  async layThongTinKhachHang(id: string) {
    const khachHang = await this.dichVuKhachHang.timTheoId(id);
    if (!khachHang) {
      throw new NotFoundException('Customer not found');
    }
    return {
      id: khachHang._id,
      soDienThoai: khachHang.soDienThoai,
      ten: khachHang.ten,
      email: khachHang.email,
      diaChi: khachHang.diaChi,
      role: khachHang.role,
    };
  }

  /**
   * Cập nhật thông tin khách hàng
   */
  async capNhatProfile(id: string, dto: CapNhatProfileDto) {
    const updateData: any = {};
    if (dto.ten !== undefined && dto.ten !== null) {
      updateData.ten = dto.ten.trim() || undefined;
    }
    if (dto.email !== undefined && dto.email !== null && dto.email.trim() !== '') {
      updateData.email = dto.email.trim();
    } else if (dto.email === '') {
      // Allow setting email to empty string to clear it
      updateData.email = undefined;
    }
    if (dto.diaChi !== undefined && dto.diaChi !== null) {
      updateData.diaChi = dto.diaChi.trim() || undefined;
    }

    const khachHang = await this.dichVuKhachHang.capNhat(id, updateData);
    
    return {
      id: khachHang._id,
      soDienThoai: khachHang.soDienThoai,
      ten: khachHang.ten,
      email: khachHang.email,
      diaChi: khachHang.diaChi,
      role: khachHang.role,
    };
  }

  /**
   * Cập nhật thông tin cá nhân cho Admin/Staff.
   * - Tên, số điện thoại: cả Admin và Nhân viên đều được sửa.
   * - Đổi mật khẩu: chỉ Quản trị viên (admin) mới được; bắt buộc gửi currentPassword đúng.
   */
  async capNhatProfileNhanVien(userId: string, dto: CapNhatProfileNhanVienDto) {
    const userWithPass = await this.dichVuNguoiDung.findOneWithPassword(userId);
    if (!userWithPass) {
      throw new NotFoundException('User not found');
    }

    if (dto.newPassword) {
      if (userWithPass.role !== VaiTroNguoiDung.ADMIN) {
        throw new ForbiddenException('Chỉ quản trị viên mới được đổi mật khẩu.');
      }
      if (!dto.currentPassword?.trim()) {
        throw new BadRequestException('Vui lòng nhập mật khẩu hiện tại để đổi mật khẩu.');
      }
      const match = await bcrypt.compare(dto.currentPassword, userWithPass.password);
      if (!match) {
        throw new BadRequestException('Mật khẩu hiện tại không đúng.');
      }
    }

    const updateData: { fullName?: string; phone?: string; password?: string } = {};
    if (dto.fullName !== undefined && dto.fullName.trim()) updateData.fullName = dto.fullName.trim();
    if (dto.phone !== undefined) updateData.phone = dto.phone.trim() || undefined;
    if (dto.newPassword?.trim()) updateData.password = dto.newPassword;

    const user = await this.dichVuNguoiDung.updateProfile(userId, updateData);
    const u = user as any;
    return {
      id: u._id ?? u.id,
      email: u.email,
      fullName: u.fullName,
      phone: u.phone,
      role: u.role,
    };
  }
}

