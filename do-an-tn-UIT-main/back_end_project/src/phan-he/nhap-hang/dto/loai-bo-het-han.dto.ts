import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class LoaiBoHetHanDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'ID sản phẩm cần loại bỏ hàng hết hạn' })
  @IsString()
  @IsNotEmpty()
  productId: string;
}
