/**
 * Purchase Service - Business Logic Layer
 * Xử lý các nghiệp vụ liên quan đến phiếu nhập hàng
 */

import { Purchase, CreatePurchaseDto, UpdatePurchaseDto, PurchaseSummary, PurchaseItem } from '../entities/Purchase'
import { PurchaseRecommendation, PurchaseRecommendationItem } from '../entities/PurchaseRecommendation'
import { IPurchaseRepository } from '../repositories/PurchaseRepository'
import { Product } from '../../products/entities/Product'

export class PurchaseService {
  constructor(private readonly repository: IPurchaseRepository) {}

  async getAllPurchases(): Promise<Purchase[]> {
    return this.repository.findAll()
  }

  async getPurchaseById(id: string): Promise<Purchase | null> {
    return this.repository.findById(id)
  }

  async createPurchase(purchaseDto: CreatePurchaseDto): Promise<Purchase> {
    // Validate business rules
    if (!purchaseDto.items || purchaseDto.items.length === 0) {
      throw new Error('Phiếu nhập hàng phải có ít nhất một sản phẩm')
    }
    
    // Kiểm tra số lượng hợp lệ
    for (const item of purchaseDto.items) {
      if (item.quantity <= 0) {
        throw new Error(`Số lượng sản phẩm phải lớn hơn 0`)
      }
    }
    
    return this.repository.create(purchaseDto)
  }

  async updatePurchase(id: string, purchaseDto: UpdatePurchaseDto): Promise<Purchase> {
    return this.repository.update(id, purchaseDto)
  }

  async deletePurchase(id: string): Promise<void> {
    return this.repository.delete(id)
  }

  async getPurchasesByDateRange(startDate: Date, endDate: Date): Promise<Purchase[]> {
    return this.repository.getPurchasesByDateRange(startDate, endDate)
  }

  async getPurchaseSummary(startDate: Date, endDate: Date): Promise<PurchaseSummary> {
    return this.repository.getPurchaseSummary(startDate, endDate)
  }

  async getTodayPurchaseSummary(): Promise<PurchaseSummary> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    return this.getPurchaseSummary(today, tomorrow)
  }

  async getWeekPurchaseSummary(): Promise<PurchaseSummary> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 7)
    
    return this.getPurchaseSummary(weekAgo, today)
  }

  async getMonthPurchaseSummary(): Promise<PurchaseSummary> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const monthAgo = new Date(today)
    monthAgo.setDate(monthAgo.getDate() - 30)
    
    return this.getPurchaseSummary(monthAgo, today)
  }

  // Tính toán tổng tiền cho phiếu nhập
  calculatePurchaseTotals(items: PurchaseItem[]): number {
    // Tính tổng tiền hàng
    return items.reduce((sum, item) => sum + item.subtotal, 0)
  }

  // Tạo PurchaseItem từ Product
  createPurchaseItem(product: Product, quantity: number, unitPrice: number): PurchaseItem {
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

  // Recommendations methods
  async getRecommendations(): Promise<PurchaseRecommendation> {
    return this.repository.getRecommendations()
  }

  async getHighPriorityRecommendations(): Promise<PurchaseRecommendationItem[]> {
    return this.repository.getHighPriorityRecommendations()
  }

  async getLowPriorityRecommendations(): Promise<PurchaseRecommendationItem[]> {
    return this.repository.getLowPriorityRecommendations()
  }
}
