import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export enum TrangThaiThanhToan {
  PAID = 'PAID',
  DEBT = 'DEBT',
  REFUNDED = 'REFUNDED',
}

export class CapNhatTrangThaiThanhToanDto {
  @ApiProperty({
    enum: TrangThaiThanhToan,
    example: TrangThaiThanhToan.PAID,
  })
  @IsEnum(TrangThaiThanhToan)
  paymentStatus: TrangThaiThanhToan;
}
