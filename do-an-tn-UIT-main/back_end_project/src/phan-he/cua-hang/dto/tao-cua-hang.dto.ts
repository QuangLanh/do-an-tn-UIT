import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { GoiCuoc, NganhHang } from '../../../dung-chung/liet-ke/nganh-hang.enum';

export class TaoCuaHangDto {
  @ApiProperty({ example: 'tap-hoa-minh-anh', description: 'Mã trên URL, chỉ chữ thường, số và dấu gạch ngang' })
  @IsString()
  @Matches(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
    message: 'Mã cửa hàng chỉ gồm chữ thường, số và dấu gạch ngang',
  })
  @MinLength(3)
  ma: string;

  @ApiProperty({ example: 'Tạp hóa Minh Anh' })
  @IsString()
  @MinLength(2)
  ten: string;

  @ApiPropertyOptional({ enum: NganhHang, default: NganhHang.TAP_HOA })
  @IsOptional()
  @IsEnum(NganhHang)
  nganhHang?: NganhHang;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  diaChi?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  soDienThoai?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email?: string;

  @ApiPropertyOptional({ enum: GoiCuoc, default: GoiCuoc.DUNG_THU })
  @IsOptional()
  @IsEnum(GoiCuoc)
  goiCuoc?: GoiCuoc;
}
