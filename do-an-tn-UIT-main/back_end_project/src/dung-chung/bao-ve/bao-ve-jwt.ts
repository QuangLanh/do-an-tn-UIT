import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { KHOA_CONG_KHAI } from '../trang-tri/cong-khai.trang-tri';

@Injectable()
export class BaoVeJwt extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  private laCongKhai(context: ExecutionContext): boolean {
    return (
      this.reflector.getAllAndOverride<boolean>(KHOA_CONG_KHAI, [
        context.getHandler(),
        context.getClass(),
      ]) === true
    );
  }

  /**
   * Endpoint công khai vẫn cố xác thực token nếu request có gửi.
   *
   * Lý do: một số endpoint vừa phục vụ khách vãng lai (không token, cửa hàng lấy
   * từ header `X-Store-Code`) vừa phục vụ trang quản trị đã đăng nhập
   * (cửa hàng nằm trong token). Nếu bỏ qua token hoàn toàn thì request của trang
   * quản trị sẽ không có ngữ cảnh cửa hàng và mọi truy vấn sẽ bị chặn.
   *
   * Token sai hoặc hết hạn không làm hỏng request công khai — chỉ đơn giản là
   * không có người dùng.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (!this.laCongKhai(context)) {
      return (await super.canActivate(context)) as boolean;
    }

    const request = context.switchToHttp().getRequest();
    if (request?.headers?.authorization) {
      try {
        await super.canActivate(context);
      } catch {
        // Endpoint công khai: token hỏng cũng vẫn cho đi tiếp
      }
    }

    return true;
  }

  handleRequest<TUser = any>(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
    status?: any,
  ): TUser {
    if (this.laCongKhai(context)) {
      return (user ?? null) as TUser;
    }
    return super.handleRequest(err, user, info, context, status);
  }
}
