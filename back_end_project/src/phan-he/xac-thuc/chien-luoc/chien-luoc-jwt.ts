import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtTaiDuLieu } from '../../../dung-chung/giao-dien/jwt-payload.giao-dien';
import { DichVuNguoiDung } from '../../nguoi-dung/nguoi-dung.dich-vu';

@Injectable()
export class ChienLuocJwt extends PassportStrategy(Strategy) {
  constructor(private dichVuNguoiDung: DichVuNguoiDung) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'default_secret_change_in_production',
    });
  }

  async validate(payload: JwtTaiDuLieu) {
    const user = await this.dichVuNguoiDung.findOne(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}

