import { ApiProperty } from '@nestjs/swagger';

export class PurchaseRecommendationItemDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  productId: string;

  @ApiProperty({ example: 'Coca Cola 330ml' })
  productName: string;

  @ApiProperty({ example: 50 })
  currentStock: number;

  @ApiProperty({ example: 20 })
  minStockLevel: number;

  @ApiProperty({ example: 15.5 })
  averageDailySales: number;

  @ApiProperty({ example: 120 })
  totalSoldLast30Days: number;

  @ApiProperty({ example: 85 })
  recommendedQuantity: number;

  @ApiProperty({ example: 'high' })
  priority: 'high' | 'medium' | 'low';

  @ApiProperty({ example: 'Bán chạy và tồn kho thấp' })
  reason: string;

  @ApiProperty({ example: 8000 })
  suggestedPurchasePrice?: number;
}

export class PurchaseRecommendationDto {
  @ApiProperty({ type: [PurchaseRecommendationItemDto] })
  highPriority: PurchaseRecommendationItemDto[];

  @ApiProperty({ type: [PurchaseRecommendationItemDto] })
  mediumPriority: PurchaseRecommendationItemDto[];

  @ApiProperty({ type: [PurchaseRecommendationItemDto] })
  lowPriority: PurchaseRecommendationItemDto[];

  @ApiProperty({ example: '2024-10-30T10:00:00.000Z' })
  generatedAt: string;
}

