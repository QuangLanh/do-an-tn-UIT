import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class MucNhapHangDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsString()
  productId: string;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: 8000 })
  @IsNumber()
  @Min(0)
  purchasePrice: number;

  @ApiProperty({ example: '2026-12-31', required: false, description: 'Hạn sử dụng (ISO 8601: YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @ApiProperty({ example: '2026-01-01', required: false, description: 'Ngày sản xuất (ISO 8601: YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  manufactureDate?: string;

  @ApiProperty({ example: 'LOT-2026-001', required: false, description: 'Số lô sản xuất' })
  @IsOptional()
  @IsString()
  lotNumber?: string;
}

export class TaoNhapHangDto {
  @ApiProperty({ type: [MucNhapHangDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MucNhapHangDto)
  items: MucNhapHangDto[];

  @ApiProperty({ example: 'ABC Supplier Co.' })
  @IsString()
  supplier: string;

  @ApiProperty({
    example: '65f1f77bcf86cd7994390112',
    required: false,
    description: 'ID nhà cung cấp trong hệ thống (ObjectId MongoDB)',
  })
  @IsString()
  @IsOptional()
  supplierId?: string;

  @ApiProperty({ example: '0987654321', required: false })
  @IsString()
  @IsOptional()
  supplierContact?: string;

  @ApiProperty({ example: 'Urgent order', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}

