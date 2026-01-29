export interface Product {
  id: string
  name: string
  category: string
  unit: string
  salePrice: number
  costPrice: number
  stock: number
  imageUrl?: string
  description?: string
  createdAt?: string
  updatedAt?: string
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface CustomerInfo {
  name: string
  phone: string
  address: string
  email?: string
}

export interface OrderItem {
  productId: string
  productName: string
  quantity: number
  price: number
}

export interface Order {
  id: string
  customerInfo: CustomerInfo
  items: OrderItem[]
  totalAmount: number
  status: OrderStatus
  paymentStatus: 'unpaid' | 'paid'
  paymentMethod: 'cash' | 'transfer'
  notes?: string
  createdAt: string
  updatedAt: string
}

export type OrderStatus = 
  | 'pending'          // Chờ xử lý
  | 'confirmed'        // Đã xác nhận
  | 'processing'       // Đang xử lý
  | 'shipping'         // Đang vận chuyển
  | 'delivered'        // Đã giao hàng
  | 'completed'        // Hoàn thành
  | 'cancelled'        // Đã hủy

export interface User {
  id: string
  name: string
  phone: string
  email?: string
  address?: string
  role: 'customer'
}

export interface AuthResponse {
  user: User
  token: string
}

export interface LoginData {
  phone: string
  otp?: string
  password?: string
}
