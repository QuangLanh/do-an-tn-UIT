import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { KHOA_VAI_TRO } from '../trang-tri/vai-tro.trang-tri';
import { VaiTroNguoiDung } from '../liet-ke/vai-tro-nguoi-dung.enum';

@Injectable()
export class BaoVeVaiTro implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<VaiTroNguoiDung[]>(
      KHOA_VAI_TRO,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      return false;
    }

    return requiredRoles.some((role) => user.role === role);
  }
}

