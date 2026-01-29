import apiClient from './client'
import { Order, OrderItem, CustomerInfo } from '@/types'

interface CreateOrderData {
  customerInfo: CustomerInfo
  items: OrderItem[]
  notes?: string
  paymentMethod?: 'cash' | 'transfer'
}

/** Chuẩn hóa status từ BE về 4 trạng thái: pending | shipping | completed | cancelled */
function normalizeStatus(status: unknown): Order['status'] {
  const s = status != null ? String(status).toLowerCase().trim() : ''
  const map: Record<string, Order['status']> = {
    pending: 'pending',
    cho_xac_nhan: 'pending',
    shipping: 'shipping',
    dang_van_chuyen: 'shipping',
    completed: 'completed',
    hoan_thanh: 'completed',
    delivered: 'completed',
    cancelled: 'cancelled',
    da_huy: 'cancelled',
  }
  return map[s] ?? (s as Order['status']) ?? 'pending'
}

// Helper function to normalize order (convert _id to id, ensure items is array, status chuẩn hóa)
const normalizeOrder = (order: any): Order => {
  if (!order) return order
  
  // Map backend fields to frontend structure
  const normalized: Order = {
    ...order,
    id: order.id || order._id || '',
    items: Array.isArray(order.items) ? order.items : [],
    // Chuẩn hóa status để tab "Chờ xử lý" và chuông thông báo hiển thị đúng
    status: normalizeStatus(order.status),
    // Map customer fields from backend to customerInfo object
    customerInfo: order.customerInfo || {
      name: order.customerName || '',
      phone: order.customerPhone || '',
      address: order.customerAddress || '',
      email: order.customerEmail,
    },
    // Map total to totalAmount
    totalAmount: order.totalAmount !== undefined ? order.totalAmount : (order.total !== undefined ? order.total : 0),
    // Map paymentStatus: DEBT -> unpaid, PAID -> paid, REFUNDED -> refunded
    paymentStatus: order.paymentStatus 
      ? (order.paymentStatus.toUpperCase() === 'PAID' ? 'paid' : 
         order.paymentStatus.toUpperCase() === 'DEBT' ? 'unpaid' : 
         order.paymentStatus.toLowerCase())
      : 'unpaid',
    // Map paymentMethod: ensure lowercase and map 'transfer' -> 'transfer', 'cash' -> 'cash'
    paymentMethod: order.paymentMethod 
      ? (order.paymentMethod.toLowerCase() === 'transfer' ? 'transfer' : 'cash')
      : 'cash',
  }
  
  return normalized
}

export const orderApi = {
  // Create new order
  createOrder: async (data: CreateOrderData): Promise<Order> => {
    const response = await apiClient.post('/orders/customer', data)
    return normalizeOrder(response.data)
  },

  // Get order by ID
  getOrderById: async (id: string): Promise<Order> => {
    const response = await apiClient.get(`/orders/customer/${id}`)
    return normalizeOrder(response.data)
  },

  // Get orders by phone number (for guests)
  getOrdersByPhone: async (phone: string): Promise<Order[]> => {
    const response = await apiClient.get('/orders/customer/by-phone', {
      params: { phone }
    })
    const orders = Array.isArray(response.data) ? response.data : []
    return orders.map(normalizeOrder)
  },

  // Get my orders (for logged in users)
  getMyOrders: async (): Promise<Order[]> => {
    const response = await apiClient.get('/orders/customer/my-orders')
    const orders = Array.isArray(response.data) ? response.data : []
    return orders.map(normalizeOrder)
  },

  // Cancel order
  cancelOrder: async (id: string, reason?: string): Promise<Order> => {
    const response = await apiClient.post(`/orders/customer/${id}/cancel`, { reason })
    return normalizeOrder(response.data)
  },

  /** Số đơn trạng thái "Chờ xử lý" (pending) – dùng cho badge thông báo */
  getPendingOrdersCount: async (): Promise<number> => {
    const orders = await orderApi.getMyOrders()
    return orders.filter((o) => o.status === 'pending').length
  },

  /** Danh sách đơn "Chờ xử lý" – dùng cho dropdown thông báo */
  getPendingOrders: async (): Promise<Order[]> => {
    const orders = await orderApi.getMyOrders()
    return orders.filter((o) => o.status === 'pending')
  },
}
