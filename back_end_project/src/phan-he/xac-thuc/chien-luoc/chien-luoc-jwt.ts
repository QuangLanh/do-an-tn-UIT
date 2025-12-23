import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtTaiDuLieu } from '../../../dung-chung/giao-dien/jwt-payload.giao-dien';
import { DichVuNguoiDung } from '../../nguoi-dung/nguoi-dung.dich-vu';
import { DichVuKhachHang } from '../../khach-hang/khach-hang.dich-vu';
import { VaiTroNguoiDung } from '../../../dung-chung/liet-ke/vai-tro-nguoi-dung.enum';

@Injectable()
export class ChienLuocJwt extends PassportStrategy(Strategy) {
  constructor(
    private dichVuNguoiDung: DichVuNguoiDung,
    private dichVuKhachHang: DichVuKhachHang,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'default_secret_change_in_production',
    });
  }

  async validate(payload: JwtTaiDuLieu) {
    if (payload.role === VaiTroNguoiDung.CUSTOMER) {
      const khachHang = await this.dichVuKhachHang.timTheoId(payload.sub);

      if (!khachHang) {
        throw new UnauthorizedException('Customer not found');
      }

      return {
        id: payload.sub,
        soDienThoai: payload.soDienThoai ?? khachHang.soDienThoai,
        ten: khachHang.ten,
        role: payload.role,
      };
    }

    const user = await this.dichVuNguoiDung.findOne(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: payload.sub,
      email: payload.email,
      fullName: user.fullName,
      role: payload.role,
    };
  }
}

