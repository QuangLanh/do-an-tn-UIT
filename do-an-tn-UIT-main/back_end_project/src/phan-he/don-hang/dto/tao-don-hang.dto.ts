import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class MucDonHangDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsString()
  productId: string;

  @ApiProperty({ example: 5 })
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class TaoDonHangDto {
  @ApiProperty({ type: [MucDonHangDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MucDonHangDto)
  items: MucDonHangDto[];

  @ApiProperty({ example: 0, default: 0 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  tax?: number;

  @ApiProperty({ example: 0, default: 0 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  discount?: number;

  @ApiProperty({ example: 'Nguyen Van A', required: false })
  @IsString()
  @IsOptional()
  customerName?: string;

  @ApiProperty({ example: '0123456789', required: false })
  @IsString()
  @IsOptional()
  customerPhone?: string;

  @ApiProperty({ example: 'Deliver before 5 PM', required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ example: 'cash', required: false })
  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @ApiProperty({ example: false, default: false, required: false })
  @IsBoolean()
  @IsOptional()
  isDebt?: boolean;
}

