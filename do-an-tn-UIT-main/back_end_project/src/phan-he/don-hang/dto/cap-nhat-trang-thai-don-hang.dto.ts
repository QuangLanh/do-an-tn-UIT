import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { TrangThaiDonHang } from '../../../dung-chung/liet-ke/trang-thai-don-hang.enum';

export class CapNhatTrangThaiDonHangDto {
  @ApiProperty({
    enum: TrangThaiDonHang,
    example: TrangThaiDonHang.COMPLETED,
  })
  @IsEnum(TrangThaiDonHang)
  status: TrangThaiDonHang;
}

