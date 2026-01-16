import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsString,
  ValidateNested,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SanPhamDoiDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsString()
  productId: string;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class DoiHangDto {
  @ApiProperty({ example: 'ORD2501150001' })
  @IsString()
  originalOrderCode: string;

  @ApiProperty({ 
    type: [SanPhamDoiDto],
    description: 'Danh sách sản phẩm cần đổi (trả lại)' 
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SanPhamDoiDto)
  returnItems: SanPhamDoiDto[];

  @ApiProperty({ 
    type: [SanPhamDoiDto],
    description: 'Danh sách sản phẩm mới (nhận về)' 
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SanPhamDoiDto)
  exchangeItems: SanPhamDoiDto[];
}
