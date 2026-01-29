import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, Matches } from 'class-validator';

export class TaoKhachHangDto {
  @ApiProperty({ example: '0123456789' })
  @IsString()
  @Matches(/^0\d{9}$/, { message: 'Số điện thoại phải có đúng 10 số và bắt đầu bằng 0' })
  soDienThoai: string;

  @ApiProperty({ example: 'Nguyen Van A', required: false })
  @IsString()
  @IsOptional()
  ten?: string;

  @ApiProperty({ example: 'customer@example.com', required: false })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: '123 Đường ABC', required: false })
  @IsString()
  @IsOptional()
  diaChi?: string;

  @ApiProperty({ example: true, required: false, default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
