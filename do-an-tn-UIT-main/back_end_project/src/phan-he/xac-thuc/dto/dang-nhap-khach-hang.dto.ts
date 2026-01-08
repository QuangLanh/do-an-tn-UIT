import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';

export class DangNhapKhachHangDto {
  @ApiProperty({ example: '0901234567' })
  @IsString()
  @Matches(/^(0|\+84)\d{9}$/, {
    message: 'Số điện thoại không hợp lệ (ví dụ: 0901234567 hoặc +84901234567)',
  })
  soDienThoai: string;

  @ApiProperty({ example: 'Nguyễn Văn A', required: false })
  @IsOptional()
  @IsString()
  ten?: string;
}


