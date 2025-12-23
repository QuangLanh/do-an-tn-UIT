import { VaiTroNguoiDung } from '../liet-ke/vai-tro-nguoi-dung.enum';

export interface JwtTaiDuLieu {
  sub: string;
  email?: string;
  soDienThoai?: string;
  role: VaiTroNguoiDung;
  iat?: number;
  exp?: number;
}

