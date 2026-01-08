import { SetMetadata } from '@nestjs/common';
import { VaiTroNguoiDung } from '../liet-ke/vai-tro-nguoi-dung.enum';

export const KHOA_VAI_TRO = 'roles';
export const VaiTro = (...vaiTro: VaiTroNguoiDung[]) =>
  SetMetadata(KHOA_VAI_TRO, vaiTro);

