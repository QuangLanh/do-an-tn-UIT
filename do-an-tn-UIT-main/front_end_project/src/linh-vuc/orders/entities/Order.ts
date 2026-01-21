/**
 * Order Entity - Domain Model
 * Đại diện cho đơn hàng trong hệ thống
 */

import { Product } from '../../products/entities/Product'

export interface OrderItem {
  id: string
  productId: string
  product: Product
  quantity: number
  unitPrice: number
  subtotal: number
}

export type OrderStatus = 'pending' | 'completed' | 'cancelled'
export type PaymentStatus = 'PAID' | 'DEBT' | 'REFUNDED';
export type OrderType = 'SALE' | 'EXCHANGE' | 'RETURN'

export interface Order {
  id: string
  orderNumber: string
  items: OrderItem[]
  totalAmount: number
  discount: number
  tax: number
  finalAmount: number
  status: OrderStatus
  paymentStatus?: PaymentStatus
  paidAt?: Date
  wasDebt?: boolean
  orderType?: OrderType
  relatedOrderCode?: string
  customerName?: string
  customerPhone?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
}

export type CreateOrderDto = Omit<Order, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateOrderDto = Partial<CreateOrderDto>

export interface OrderSummary {
  totalOrders: number
  totalRevenue: number
  totalProfit: number
  averageOrderValue: number
}
