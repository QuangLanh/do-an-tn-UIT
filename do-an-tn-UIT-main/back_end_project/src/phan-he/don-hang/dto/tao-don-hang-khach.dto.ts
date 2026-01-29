import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsString,
  IsNumber,
  IsOptional,
  IsEmail,
  ValidateNested,
  Min,
  IsNotEmpty,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

export class MucDonHangKhachDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ example: 'Gạo ST25' })
  @IsString()
  @IsNotEmpty()
  productName: string;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: 50000 })
  @IsNumber()
  @Min(0)
  price: number;
}

export class ThongTinKhachHangDto {
  @ApiProperty({ example: 'Nguyen Van A' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '0123456789' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{10}$/, { message: 'Số điện thoại phải có 10 chữ số' })
  phone: string;

  @ApiProperty({ example: '123 Đường ABC, Quận 1, TP.HCM' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: 'customer@example.com', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;
}

export class TaoDonHangKhachDto {
  @ApiProperty({ type: ThongTinKhachHangDto })
  @ValidateNested()
  @Type(() => ThongTinKhachHangDto)
  customerInfo: ThongTinKhachHangDto;

  @ApiProperty({ type: [MucDonHangKhachDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MucDonHangKhachDto)
  items: MucDonHangKhachDto[];

  @ApiProperty({ example: 'Giao hàng trước 5 giờ chiều', required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ 
    example: 'cash', 
    enum: ['cash', 'transfer'], 
    default: 'cash',
    required: false 
  })
  @IsString()
  @IsOptional()
  paymentMethod?: 'cash' | 'transfer';
}
