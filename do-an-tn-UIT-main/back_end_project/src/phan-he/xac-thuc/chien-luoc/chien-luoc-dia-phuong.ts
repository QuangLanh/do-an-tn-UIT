import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { DichVuXacThuc } from '../xac-thuc.dich-vu';

@Injectable()
export class ChienLuocDiaPhuong extends PassportStrategy(Strategy) {
  constructor(private dichVuXacThuc: DichVuXacThuc) {
    super({
      usernameField: 'email',
    });
  }

  async validate(email: string, password: string): Promise<any> {
    const user = await this.dichVuXacThuc.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }
}

