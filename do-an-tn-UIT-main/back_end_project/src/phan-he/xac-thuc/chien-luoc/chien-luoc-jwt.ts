import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtTaiDuLieu } from '../../../dung-chung/giao-dien/jwt-payload.giao-dien';
import { DichVuNguoiDung } from '../../nguoi-dung/nguoi-dung.dich-vu';
import { DichVuKhachHang } from '../../khach-hang/khach-hang.dich-vu';
import { VaiTroNguoiDung } from '../../../dung-chung/liet-ke/vai-tro-nguoi-dung.enum';
import { DichVuCuaHang } from '../../cua-hang/cua-hang.dich-vu';
import { datStoreIdHienTai } from '../../../dung-chung/da-cua-hang/ngu-canh-cua-hang';

@Injectable()
export class ChienLuocJwt extends PassportStrategy(Strategy) {
  constructor(
    private dichVuNguoiDung: DichVuNguoiDung,
    private dichVuKhachHang: DichVuKhachHang,
    private dichVuCuaHang: DichVuCuaHang,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'default_secret_change_in_production',
    });
  }

  /**
   * Xác thực token và **thiết lập ngữ cảnh cửa hàng cho toàn bộ request**.
   *
   * Việc tra người dùng ở đây phải chạy ngoài phạm vi cửa hàng (ngữ cảnh chưa có
   * storeId tại thời điểm này); ngay sau khi biết người dùng thuộc cửa hàng nào,
   * storeId được nạp vào ngữ cảnh để mọi truy vấn phía sau tự lọc đúng.
   */
  async validate(payload: JwtTaiDuLieu) {
    if (!payload.storeId) {
      throw new UnauthorizedException(
        'Token không có thông tin cửa hàng. Vui lòng đăng nhập lại.',
      );
    }

    const cuaHang = await this.dichVuCuaHang.timTheoId(payload.storeId);
    if (!cuaHang || !cuaHang.isActive) {
      throw new UnauthorizedException('Cửa hàng không tồn tại hoặc đã ngừng hoạt động');
    }

    if (payload.role === VaiTroNguoiDung.CUSTOMER) {
      const khachHang = await this.dichVuKhachHang.timTheoIdToanHeThong(payload.sub);

      if (!khachHang) {
        throw new UnauthorizedException('Customer not found');
      }

      if (khachHang.storeId?.toString() !== payload.storeId) {
        throw new UnauthorizedException('Token không khớp với cửa hàng');
      }

      datStoreIdHienTai(payload.storeId);

      return {
        id: payload.sub,
        soDienThoai: payload.soDienThoai ?? khachHang.soDienThoai,
        ten: khachHang.ten,
        role: payload.role,
        storeId: payload.storeId,
      };
    }

    const user = await this.dichVuNguoiDung.timTheoIdToanHeThong(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.storeId?.toString() !== payload.storeId) {
      throw new UnauthorizedException('Token không khớp với cửa hàng');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Tài khoản đã bị khóa');
    }

    datStoreIdHienTai(payload.storeId);

    return {
      id: payload.sub,
      email: payload.email,
      fullName: user.fullName,
      phone: user.phone,
      role: payload.role,
      storeId: payload.storeId,
    };
  }
}

