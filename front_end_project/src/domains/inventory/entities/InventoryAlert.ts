/**
 * Inventory Alert Entity
 * Cảnh báo tồn kho
 */

import { Product } from '../../products/entities/Product'

export interface InventoryAlert {
  id: string
  product: Product
  currentStock: number
  threshold: number
  alertLevel: 'low' | 'critical' | 'out_of_stock'
  suggestedReorderQuantity: number
  createdAt: Date
}

export type AlertLevel = 'low' | 'critical' | 'out_of_stock'

