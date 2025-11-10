/**
 * Real Order Repository - API Implementation
 * Sử dụng API thực từ backend thay vì localStorage
 */

import { IOrderRepository } from './OrderRepository'
import {
  Order,
  CreateOrderDto,
  UpdateOrderDto,
  OrderSummary,
  OrderItem,
} from '../entities/Order'
import { Product } from '../../products/entities/Product'
import { apiService } from '@/infra/api'

/**
 * Map backend order response to frontend Order entity
 */
function mapBackendToFrontend(backendOrder: any): Order {
  const items: OrderItem[] = (backendOrder.items || []).map((item: any) => {
    // Backend returns product as ObjectId or populated object
    const product: Product = item.product && typeof item.product === 'object'
      ? {
          id: item.product._id || item.product.id,
          name: item.product.name || item.productName,
          category: item.product.category || '',
          importPrice: item.product.purchasePrice || 0,
          salePrice: item.product.salePrice || item.price || 0,
          stock: item.product.stock || 0,
          unit: item.product.unit || '',
          supplier: '',
          description: item.product.description,
          createdAt: new Date(item.product.createdAt || Date.now()),
          updatedAt: new Date(item.product.updatedAt || Date.now()),
        }
      : {
          id: item.product || '',
          name: item.productName || '',
          category: '',
          importPrice: 0,
          salePrice: item.price || 0,
          stock: 0,
          unit: '',
          supplier: '',
          createdAt: new Date(),
          updatedAt: new Date(),
        }

    return {
      id: item._id || item.id || '',
      productId: typeof item.product === 'string' ? item.product : (item.product?._id || item.product?.id || ''),
      product,
      quantity: item.quantity,
      unitPrice: item.price || item.unitPrice || 0,
      subtotal: item.subtotal || item.quantity * (item.price || 0),
    }
  })

  return {
    id: backendOrder._id || backendOrder.id,
    orderNumber: backendOrder.orderNumber || '',
    items,
    totalAmount: backendOrder.subtotal || backendOrder.totalAmount || 0,
    discount: backendOrder.discount || 0,
    tax: backendOrder.tax || 0,
    finalAmount: backendOrder.total || backendOrder.finalAmount || 0,
    status: backendOrder.status || 'pending',
    customerName: backendOrder.customerName,
    customerPhone: backendOrder.customerPhone,
    notes: backendOrder.notes,
    createdAt: new Date(backendOrder.createdAt || Date.now()),
    updatedAt: new Date(backendOrder.updatedAt || Date.now()),
    completedAt: backendOrder.completedAt ? new Date(backendOrder.completedAt) : undefined,
  }
}

/**
 * Map frontend CreateOrderDto to backend DTO
 */
function mapFrontendToBackend(orderDto: CreateOrderDto | UpdateOrderDto): any {
  return {
    items: orderDto.items?.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
    })),
    tax: orderDto.tax || 0,
    discount: orderDto.discount || 0,
    customerName: orderDto.customerName,
    customerPhone: orderDto.customerPhone,
    paymentMethod: 'cash', // Default payment method
    notes: orderDto.notes,
  }
}

export class RealOrderRepository implements IOrderRepository {
  async findAll(): Promise<Order[]> {
    try {
      const response = await apiService.orders.list()
      const orders = Array.isArray(response) ? response : (response as any).data || response
      return Array.isArray(orders)
        ? orders.map(mapBackendToFrontend)
        : []
    } catch (error) {
      console.error('Error fetching orders:', error)
      throw error
    }
  }

  async findById(id: string): Promise<Order | null> {
    try {
      const order = await apiService.orders.detail(id)
      return order ? mapBackendToFrontend(order) : null
    } catch (error) {
      console.error('Error fetching order:', error)
      return null
    }
  }

  async create(orderDto: CreateOrderDto): Promise<Order> {
    try {
      const backendDto = mapFrontendToBackend(orderDto)
      const createdOrder = await apiService.orders.create(backendDto)
      return mapBackendToFrontend(createdOrder)
    } catch (error) {
      console.error('Error creating order:', error)
      throw error
    }
  }

  async update(id: string, orderDto: UpdateOrderDto): Promise<Order> {
    try {
      // Backend chỉ hỗ trợ update status
      if (orderDto.status) {
        await apiService.orders.updateStatus(id, { status: orderDto.status })
        return this.findById(id) as Promise<Order>
      }
      throw new Error('Only status update is supported')
    } catch (error) {
      console.error('Error updating order:', error)
      throw error
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await apiService.orders.delete(id)
    } catch (error) {
      console.error('Error deleting order:', error)
      throw error
    }
  }

  async getOrdersByDateRange(startDate: Date, endDate: Date): Promise<Order[]> {
    try {
      const response = await apiService.orders.list({
        from: startDate.toISOString(),
        to: endDate.toISOString(),
      })
      const orders = Array.isArray(response) ? response : (response as any).data || response
      return Array.isArray(orders)
        ? orders.map(mapBackendToFrontend)
        : []
    } catch (error) {
      console.error('Error fetching orders by date range:', error)
      throw error
    }
  }

  async getOrderSummary(startDate: Date, endDate: Date): Promise<OrderSummary> {
    try {
      const stats = await apiService.orders.statistics({
        from: startDate.toISOString(),
        to: endDate.toISOString(),
      })

      // Map backend response to OrderSummary
      return {
        totalOrders: stats.totalOrders || 0,
        totalRevenue: stats.totalRevenue || 0,
        totalProfit: stats.totalProfit || (stats.totalRevenue || 0) - (stats.totalCost || 0),
        averageOrderValue: stats.averageOrderValue || 0,
      }
    } catch (error) {
      console.error('Error fetching order summary:', error)
      throw error
    }
  }
}

