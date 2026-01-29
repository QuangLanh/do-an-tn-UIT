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

/** Trạng thái đơn hàng đặt online (thống nhất với BE và customer app) */
export type OrderStatus =
  | 'pending'   // Chờ xử lý
  | 'shipping'  // Đang vận chuyển
  | 'completed' // Hoàn thành
  | 'cancelled' // Đã hủy

export type PaymentStatus = 'PAID' | 'DEBT' | 'REFUNDED'
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
  hasAfterSale?: boolean
  customerName?: string
  customerPhone?: string
  customerAddress?: string
  customerEmail?: string
  notes?: string
  isOnline?: boolean // Đánh dấu đơn hàng được đặt online
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
