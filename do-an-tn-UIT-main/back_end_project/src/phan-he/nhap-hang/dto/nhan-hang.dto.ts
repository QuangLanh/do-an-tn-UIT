import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class MucNhanHangDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsString()
  productId: string;

  @ApiProperty({ example: 95, description: 'Số lượng nhận thực tế (>= 0)' })
  @IsNumber()
  @Min(0)
  receivedQuantity: number;

  @ApiProperty({ example: 8200, description: 'Giá nhập thực tế' })
  @IsNumber()
  @Min(0)
  actualPurchasePrice: number;

  @ApiProperty({ example: '2026-01-01', description: 'Ngày sản xuất (YYYY-MM-DD)' })
  @IsDateString()
  manufactureDate: string;

  @ApiProperty({ example: '2026-12-31', description: 'Hạn sử dụng (YYYY-MM-DD)' })
  @IsDateString()
  expiryDate: string;

  @ApiProperty({ example: 'LOT-2026-001', required: false })
  @IsString()
  @IsOptional()
  lotNumber?: string;
}

export class NhanHangDto {
  @ApiProperty({ type: [MucNhanHangDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MucNhanHangDto)
  items: MucNhanHangDto[];

  @ApiProperty({ example: 'Giao thiếu 1 thùng, đã cập nhật thực tế', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}

