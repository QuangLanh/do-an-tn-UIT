/**
 * Order Service - Business Logic Layer
 * Xử lý các nghiệp vụ liên quan đến đơn hàng
 */

import { Order, CreateOrderDto, UpdateOrderDto, OrderSummary, OrderItem } from '../entities/Order'
import { IOrderRepository } from '../repositories/OrderRepository'
import { Product } from '../../products/entities/Product'

export class OrderService {
  constructor(private readonly repository: IOrderRepository) {}

  async getAllOrders(): Promise<Order[]> {
    return this.repository.findAll()
  }

  async getOrderById(id: string): Promise<Order | null> {
    return this.repository.findById(id)
  }

  async createOrder(orderDto: CreateOrderDto): Promise<Order> {
    // Validate business rules
    if (!orderDto.items || orderDto.items.length === 0) {
      throw new Error('Đơn hàng phải có ít nhất một sản phẩm')
    }
    
    // Kiểm tra số lượng hợp lệ
    for (const item of orderDto.items) {
      if (item.quantity <= 0) {
        throw new Error(`Số lượng sản phẩm phải lớn hơn 0`)
      }
      
      if (item.product.stock < item.quantity) {
        throw new Error(`Sản phẩm "${item.product.name}" không đủ số lượng trong kho`)
      }
    }
    
    return this.repository.create(orderDto)
  }

  async updateOrder(id: string, orderDto: UpdateOrderDto): Promise<Order> {
    return this.repository.update(id, orderDto)
  }

  async deleteOrder(id: string): Promise<void> {
    return this.repository.delete(id)
  }

  async getOrdersByDateRange(startDate: Date, endDate: Date): Promise<Order[]> {
    return this.repository.getOrdersByDateRange(startDate, endDate)
  }

  async getOrderSummary(startDate: Date, endDate: Date): Promise<OrderSummary> {
    return this.repository.getOrderSummary(startDate, endDate)
  }

  async getTodayOrderSummary(): Promise<OrderSummary> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    return this.getOrderSummary(today, tomorrow)
  }

  async getWeekOrderSummary(): Promise<OrderSummary> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 7)
    
    return this.getOrderSummary(weekAgo, today)
  }

  async getMonthOrderSummary(): Promise<OrderSummary> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const monthAgo = new Date(today)
    monthAgo.setDate(monthAgo.getDate() - 30)
    
    return this.getOrderSummary(monthAgo, today)
  }

  // Tính toán các giá trị cho đơn hàng
  calculateOrderTotals(items: OrderItem[], discount: number = 0, taxRate: number = 0): {
    subtotal: number;
    tax: number;
    finalAmount: number;
  } {
    // Tính tổng tiền hàng
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0)
    
    // Tính thuế
    const tax = subtotal * (taxRate / 100)
    
    // Tính tổng tiền sau khi trừ giảm giá và cộng thuế
    const finalAmount = subtotal - discount + tax
    
    return {
      subtotal,
      tax,
      finalAmount
    }
  }

  // Tạo OrderItem từ Product
  createOrderItem(product: Product, quantity: number): OrderItem {
    const unitPrice = product.salePrice
    const subtotal = unitPrice * quantity
    
    return {
      id: Date.now().toString(),
      productId: product.id,
      product,
      quantity,
      unitPrice,
      subtotal
    }
  }
}
