import { VaiTroNguoiDung } from '../liet-ke/vai-tro-nguoi-dung.enum';

export interface JwtTaiDuLieu {
  sub: string;
  email?: string;
  soDienThoai?: string;
  role: VaiTroNguoiDung;
  /** Cửa hàng mà tài khoản này thuộc về — nguồn duy nhất để lọc dữ liệu theo tenant. */
  storeId: string;
  iat?: number;
  exp?: number;
}

