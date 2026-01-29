import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, IsOptional } from 'class-validator';

export class VerifyOtpDto {
  @ApiProperty({ example: '0901234567' })
  @IsString()
  @Matches(/^0\d{9}$/, {
    message: 'Số điện thoại phải có đúng 10 số và bắt đầu bằng 0',
  })
  phone: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  otp: string;

  @ApiProperty({ example: 'Nguyễn Văn A', required: false })
  @IsOptional()
  @IsString()
  ten?: string;
}
