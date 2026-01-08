import { PartialType } from '@nestjs/swagger';
import { TaoSanPhamDto } from './tao-san-pham.dto';

export class CapNhatSanPhamDto extends PartialType(TaoSanPhamDto) {}

