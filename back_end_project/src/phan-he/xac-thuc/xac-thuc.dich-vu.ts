import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { DichVuNguoiDung } from '../nguoi-dung/nguoi-dung.dich-vu';
import { DangKyDto } from './dto/dang-ky.dto';
import { DangNhapDto } from './dto/dang-nhap.dto';
import { JwtTaiDuLieu } from '../../dung-chung/giao-dien/jwt-payload.giao-dien';
import { VaiTroNguoiDung } from '../../dung-chung/liet-ke/vai-tro-nguoi-dung.enum';
import { UserDocument } from '../nguoi-dung/schemas/user.schema';

@Injectable()
export class DichVuXacThuc {
  private readonly logger = new Logger(DichVuXacThuc.name);

  constructor(
    private dichVuNguoiDung: DichVuNguoiDung,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.dichVuNguoiDung.findByEmail(email);

    if (!user) {
      return null;
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive');
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
      throw new UnauthorizedException('Invalid credentials');
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
}

