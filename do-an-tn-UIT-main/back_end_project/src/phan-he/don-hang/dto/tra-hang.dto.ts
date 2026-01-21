import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsString,
  ValidateNested,
  IsNumber,
  Min,
  IsBoolean,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SanPhamTraDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class TraHangDto {
  @ApiProperty({ example: 'ORD2501150001', description: 'Mã đơn hàng gốc' })
  @IsString()
  @IsNotEmpty()
  originalOrderCode: string;

  @ApiProperty({ 
    type: [SanPhamTraDto],
    description: 'Danh sách sản phẩm cần trả' 
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SanPhamTraDto)
  returnItems: SanPhamTraDto[];

  // --- CÁC TRƯỜNG MỚI BỔ SUNG ---

  @ApiProperty({ example: 'Hàng bị lỗi bao bì', description: 'Lý do trả hàng' })
  @IsString()
  @IsNotEmpty()
  returnReason: string;

  @ApiProperty({ example: true, description: 'True: Nhập lại kho, False: Hủy hàng' })
  @IsBoolean()
  @IsOptional() // Cho phép không gửi (mặc định sẽ xử lý ở Service)
  isRestocked?: boolean;

  @ApiProperty({ example: 'Khách khó tính', required: false, description: 'Ghi chú thêm' })
  @IsString()
  @IsOptional()
  notes?: string;
}