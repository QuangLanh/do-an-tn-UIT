/**
 * Order Repository Interface
 * Định nghĩa các phương thức tương tác với data source cho đơn hàng
 */

import { Order, CreateOrderDto, UpdateOrderDto, OrderSummary } from '../entities/Order'
import { ProductRepository } from '../../products/repositories/ProductRepository'
import { Product } from '../../products/entities/Product'

export interface IOrderRepository {
  findAll(): Promise<Order[]>
  findById(id: string): Promise<Order | null>
  create(order: CreateOrderDto): Promise<Order>
  update(id: string, order: UpdateOrderDto): Promise<Order>
  delete(id: string): Promise<void>
  getOrdersByDateRange(startDate: Date, endDate: Date): Promise<Order[]>
  getOrderSummary(startDate: Date, endDate: Date): Promise<OrderSummary>
}

/**
 * Mock Implementation - Sử dụng localStorage để simulate backend
 */
export class OrderRepository implements IOrderRepository {
  private readonly STORAGE_KEY = 'grocery_orders'
  private readonly productRepository: ProductRepository

  constructor() {
    this.productRepository = new ProductRepository()
  }

  private getOrders(): Order[] {
    const data = localStorage.getItem(this.STORAGE_KEY)
    if (!data) {
      const initialOrders = this.getInitialOrders()
      this.saveOrders(initialOrders)
      return initialOrders
    }
    return JSON.parse(data).map((o: any) => ({
      ...o,
      createdAt: new Date(o.createdAt),
      updatedAt: new Date(o.updatedAt),
      completedAt: o.completedAt ? new Date(o.completedAt) : undefined,
    }))
  }

  private saveOrders(orders: Order[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(orders))
  }

  private async getProduct(id: string): Promise<Product | null> {
    return this.productRepository.findById(id)
  }

  private getInitialOrders(): Order[] {
    // Sẽ được tự động tạo khi không có dữ liệu
    return []
  }

  private generateOrderNumber(): string {
    const date = new Date()
    const year = date.getFullYear().toString().substr(-2)
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `HD${year}${month}${day}-${random}`
  }

  async findAll(): Promise<Order[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(this.getOrders()), 100)
    })
  }

  async findById(id: string): Promise<Order | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const orders = this.getOrders()
        const order = orders.find((o) => o.id === id)
        resolve(order || null)
      }, 100)
    })
  }

  async create(orderDto: CreateOrderDto): Promise<Order> {
    return new Promise(async (resolve) => {
      setTimeout(async () => {
        const orders = this.getOrders()
        
        // Lấy thông tin sản phẩm đầy đủ
        for (const item of orderDto.items) {
          const product = await this.getProduct(item.productId)
          if (product) {
            item.product = product
            
            // Cập nhật tồn kho sản phẩm
            const updatedProduct = { ...product, stock: product.stock - item.quantity }
            await this.productRepository.update(product.id, updatedProduct)
          }
        }

        const newOrder: Order = {
          ...orderDto,
          id: Date.now().toString(),
          orderNumber: this.generateOrderNumber(),
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        
        orders.push(newOrder)
        this.saveOrders(orders)
        resolve(newOrder)
      }, 100)
    })
  }

  async update(id: string, orderDto: UpdateOrderDto): Promise<Order> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const orders = this.getOrders()
        const index = orders.findIndex((o) => o.id === id)
        if (index === -1) {
          reject(new Error('Order not found'))
          return
        }
        
        const updatedOrder: Order = {
          ...orders[index],
          ...orderDto,
          updatedAt: new Date(),
        }
        
        orders[index] = updatedOrder
        this.saveOrders(orders)
        resolve(updatedOrder)
      }, 100)
    })
  }

  async delete(id: string): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const orders = this.getOrders()
        const filteredOrders = orders.filter((o) => o.id !== id)
        this.saveOrders(filteredOrders)
        resolve()
      }, 100)
    })
  }

  async getOrdersByDateRange(startDate: Date, endDate: Date): Promise<Order[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const orders = this.getOrders()
        const filteredOrders = orders.filter((order) => {
          const orderDate = new Date(order.createdAt)
          return orderDate >= startDate && orderDate <= endDate
        })
        resolve(filteredOrders)
      }, 100)
    })
  }

  async getOrderSummary(startDate: Date, endDate: Date): Promise<OrderSummary> {
    return new Promise((resolve) => {
      setTimeout(async () => {
        const orders = await this.getOrdersByDateRange(startDate, endDate)
        const completedOrders = orders.filter(o => o.status === 'completed')
        
        const totalOrders = completedOrders.length
        const totalRevenue = completedOrders.reduce((sum, order) => sum + order.finalAmount, 0)
        
        // Tính lợi nhuận (giá bán - giá nhập) cho mỗi sản phẩm
        let totalProfit = 0
        for (const order of completedOrders) {
          for (const item of order.items) {
            const profit = (item.unitPrice - item.product.importPrice) * item.quantity
            totalProfit += profit
          }
        }
        
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
        
        resolve({
          totalOrders,
          totalRevenue,
          totalProfit,
          averageOrderValue
        })
      }, 100)
    })
  }
}
