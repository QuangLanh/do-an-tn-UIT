import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  IsBoolean,
} from 'class-validator';

export class TaoSanPhamDto {
  @ApiProperty({ example: 'Coca Cola 330ml' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'SKU001' })
  @IsString()
  sku: string;

  @ApiProperty({ example: 'Soft drink', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'Beverages' })
  @IsString()
  category: string;

  @ApiProperty({ example: 8000 })
  @IsNumber()
  @Min(0)
  purchasePrice: number;

  @ApiProperty({ example: 12000 })
  @IsNumber()
  @Min(0)
  salePrice: number;

  @ApiProperty({ example: 100, default: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  stock?: number;

  @ApiProperty({ example: 10, default: 10 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  minStockLevel?: number;

  @ApiProperty({ example: 'bottle', required: false })
  @IsString()
  @IsOptional()
  unit?: string;

  @ApiProperty({ example: '8934563123456', required: false })
  @IsString()
  @IsOptional()
  barcode?: string;

  @ApiProperty({ example: 'https://example.com/image.jpg', required: false })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({ example: true, default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

