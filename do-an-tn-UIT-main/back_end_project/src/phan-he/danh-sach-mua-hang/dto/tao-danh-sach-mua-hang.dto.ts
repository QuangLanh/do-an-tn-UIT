import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsMongoId, IsNumber, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class MucDanhSachMuaHangDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsMongoId()
  productId: string;

  @ApiProperty({ example: 2, minimum: 1 })
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class TaoDanhSachMuaHangDto {
  @ApiProperty({ type: [MucDanhSachMuaHangDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MucDanhSachMuaHangDto)
  items: MucDanhSachMuaHangDto[];
}


