import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsString,
  IsNumber,
  IsOptional,
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

  @ApiProperty({ example: '0987654321', required: false })
  @IsString()
  @IsOptional()
  supplierContact?: string;

  @ApiProperty({ example: 'Urgent order', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}

