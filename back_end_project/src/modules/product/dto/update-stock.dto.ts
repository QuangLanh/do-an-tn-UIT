import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsEnum } from 'class-validator';

export enum StockOperation {
  ADD = 'add',
  SUBTRACT = 'subtract',
  SET = 'set',
}

export class UpdateStockDto {
  @ApiProperty({ enum: StockOperation, example: StockOperation.ADD })
  @IsEnum(StockOperation)
  operation: StockOperation;

  @ApiProperty({ example: 50 })
  @IsNumber()
  quantity: number;
}

