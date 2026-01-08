import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsEnum } from 'class-validator';

export enum ThaoTacTonKho {
  ADD = 'add',
  SUBTRACT = 'subtract',
  SET = 'set',
}

export class CapNhatTonKhoDto {
  @ApiProperty({ enum: ThaoTacTonKho, example: ThaoTacTonKho.ADD })
  @IsEnum(ThaoTacTonKho)
  operation: ThaoTacTonKho;

  @ApiProperty({ example: 50 })
  @IsNumber()
  quantity: number;
}

