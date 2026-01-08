/**
 * Purchase Recommendation Entity
 * Đại diện cho gợi ý nhập hàng từ backend
 */

export type RecommendationPriority = 'high' | 'medium' | 'low'

export interface PurchaseRecommendationItem {
  productId: string
  productName: string
  currentStock: number
  minStockLevel: number
  averageDailySales: number
  totalSoldLast30Days: number
  recommendedQuantity: number
  priority: RecommendationPriority
  reason: string
  suggestedPurchasePrice?: number
}

export interface PurchaseRecommendation {
  highPriority: PurchaseRecommendationItem[]
  mediumPriority: PurchaseRecommendationItem[]
  lowPriority: PurchaseRecommendationItem[]
  generatedAt: string
}

