import { ApiProperty } from '@nestjs/swagger';

export class MucGoiYNhapHangDto {
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

  // ─── Seasonal fields ───────────────────────────────────────────────────────
  @ApiProperty({ example: 1.4, description: 'Hệ số mùa vụ theo tháng hiện tại (>1 tăng, <1 giảm, =1 bình thường)' })
  seasonalFactor: number;

  @ApiProperty({ example: 21.7, description: 'Nhu cầu điều chỉnh theo mùa vụ: averageDailySales × seasonalFactor' })
  seasonalDemand: number;

  @ApiProperty({ example: 174, description: 'Điểm tái đặt hàng: (seasonalDemand × leadTime) + safetyStock' })
  reorderPoint: number;

  @ApiProperty({ example: 'Tháng 6 – mùa nóng (+40%)' })
  seasonLabel: string;
  // ───────────────────────────────────────────────────────────────────────────

  @ApiProperty({ example: 85 })
  recommendedQuantity: number;

  @ApiProperty({ example: 'high' })
  priority: 'high' | 'medium' | 'low';

  @ApiProperty({ example: 'Bán chạy và tồn kho thấp' })
  reason: string;

  @ApiProperty({ example: 8000 })
  suggestedPurchasePrice?: number;
}

export class GoiYNhapHangDto {
  @ApiProperty({ type: [MucGoiYNhapHangDto] })
  highPriority: MucGoiYNhapHangDto[];

  @ApiProperty({ type: [MucGoiYNhapHangDto] })
  mediumPriority: MucGoiYNhapHangDto[];

  @ApiProperty({ type: [MucGoiYNhapHangDto] })
  lowPriority: MucGoiYNhapHangDto[];

  @ApiProperty({ example: '2024-10-30T10:00:00.000Z' })
  generatedAt: string;

  @ApiProperty({ example: 6, description: 'Tháng hiện tại (1–12)' })
  currentMonth: number;

  @ApiProperty({ example: 'Tháng 6 – mùa nóng (+40%)' })
  currentSeasonLabel: string;
}

