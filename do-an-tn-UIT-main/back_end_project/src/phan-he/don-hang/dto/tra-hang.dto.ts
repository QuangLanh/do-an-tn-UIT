import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsString,
  ValidateNested,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SanPhamTraDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsString()
  productId: string;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class TraHangDto {
  @ApiProperty({ example: 'ORD2501150001' })
  @IsString()
  originalOrderCode: string;

  @ApiProperty({ 
    type: [SanPhamTraDto],
    description: 'Danh sách sản phẩm cần trả' 
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SanPhamTraDto)
  returnItems: SanPhamTraDto[];
}
