/**
 * Purchase Entity - Domain Model
 * Đại diện cho phiếu nhập hàng trong hệ thống
 */

import { Product } from '../../products/entities/Product'

export interface PurchaseItem {
  id: string
  productId: string
  product: Product
  quantity: number
  unitPrice: number // Giá nhập
  subtotal: number
}

export type PurchaseStatus = 'pending' | 'completed' | 'cancelled'

export interface Purchase {
  id: string
  purchaseNumber: string
  items: PurchaseItem[]
  totalAmount: number
  supplierId?: string
  supplierName: string
  status: PurchaseStatus
  notes?: string
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
}

export type CreatePurchaseDto = Omit<Purchase, 'id' | 'createdAt' | 'updatedAt'>
export type UpdatePurchaseDto = Partial<CreatePurchaseDto>

export interface PurchaseSummary {
  totalPurchases: number
  totalAmount: number
  totalItems: number
}
