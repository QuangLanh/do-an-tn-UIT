import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

export class RequestOtpDto {
  @ApiProperty({ example: '0901234567' })
  @IsString()
  @Matches(/^0\d{9}$/, {
    message: 'Số điện thoại phải có đúng 10 số và bắt đầu bằng 0',
  })
  phone: string;
}
