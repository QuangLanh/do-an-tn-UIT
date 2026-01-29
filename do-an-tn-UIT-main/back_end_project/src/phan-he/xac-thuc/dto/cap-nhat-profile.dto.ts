import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEmail, ValidateIf } from 'class-validator';

export class CapNhatProfileDto {
  @ApiProperty({ example: 'Nguyễn Văn A', required: false })
  @IsOptional()
  @IsString()
  ten?: string;

  @ApiProperty({ example: 'customer@example.com', required: false })
  @ValidateIf((o) => o.email !== undefined && o.email !== '')
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email?: string;

  @ApiProperty({ example: '123 Đường ABC, Quận XYZ, TP.HCM', required: false })
  @IsOptional()
  @IsString()
  diaChi?: string;
}
