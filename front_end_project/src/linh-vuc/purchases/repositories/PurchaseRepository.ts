/**
 * Purchase Repository Interface
 * Định nghĩa các phương thức tương tác với data source cho phiếu nhập hàng
 */

import { Purchase, CreatePurchaseDto, UpdatePurchaseDto, PurchaseSummary } from '../entities/Purchase'
import { PurchaseRecommendation, PurchaseRecommendationItem } from '../entities/PurchaseRecommendation'
import { ProductRepository } from '../../products/repositories/ProductRepository'
import { Product } from '../../products/entities/Product'

export interface IPurchaseRepository {
  findAll(): Promise<Purchase[]>
  findById(id: string): Promise<Purchase | null>
  create(purchase: CreatePurchaseDto): Promise<Purchase>
  update(id: string, purchase: UpdatePurchaseDto): Promise<Purchase>
  delete(id: string): Promise<void>
  getPurchasesByDateRange(startDate: Date, endDate: Date): Promise<Purchase[]>
  getPurchaseSummary(startDate: Date, endDate: Date): Promise<PurchaseSummary>
  getRecommendations(): Promise<PurchaseRecommendation>
  getHighPriorityRecommendations(): Promise<PurchaseRecommendationItem[]>
  getLowPriorityRecommendations(): Promise<PurchaseRecommendationItem[]>
}

/**
 * Mock Implementation - Sử dụng localStorage để simulate backend
 */
export class PurchaseRepository implements IPurchaseRepository {
  private readonly STORAGE_KEY = 'grocery_purchases'
  private readonly productRepository: ProductRepository

  constructor() {
    this.productRepository = new ProductRepository()
  }

  private getPurchases(): Purchase[] {
    const data = localStorage.getItem(this.STORAGE_KEY)
    if (!data) {
      const initialPurchases = this.getInitialPurchases()
      this.savePurchases(initialPurchases)
      return initialPurchases
    }
    return JSON.parse(data).map((p: any) => ({
      ...p,
      createdAt: new Date(p.createdAt),
      updatedAt: new Date(p.updatedAt),
      completedAt: p.completedAt ? new Date(p.completedAt) : undefined,
    }))
  }

  private savePurchases(purchases: Purchase[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(purchases))
  }

  private async getProduct(id: string): Promise<Product | null> {
    return this.productRepository.findById(id)
  }

  private getInitialPurchases(): Purchase[] {
    // Sẽ được tự động tạo khi không có dữ liệu
    return []
  }

  private generatePurchaseNumber(): string {
    const date = new Date()
    const year = date.getFullYear().toString().substr(-2)
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `NH${year}${month}${day}-${random}`
  }

  async findAll(): Promise<Purchase[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(this.getPurchases()), 100)
    })
  }

  async findById(id: string): Promise<Purchase | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const purchases = this.getPurchases()
        const purchase = purchases.find((p) => p.id === id)
        resolve(purchase || null)
      }, 100)
    })
  }

  async create(purchaseDto: CreatePurchaseDto): Promise<Purchase> {
    return new Promise(async (resolve) => {
      setTimeout(async () => {
        const purchases = this.getPurchases()
        
        // Lấy thông tin sản phẩm đầy đủ và cập nhật tồn kho
        for (const item of purchaseDto.items) {
          const product = await this.getProduct(item.productId)
          if (product) {
            item.product = product
            
            // Cập nhật tồn kho sản phẩm
            const updatedProduct = { 
              ...product, 
              stock: product.stock + item.quantity 
            }
            await this.productRepository.update(product.id, updatedProduct)
          }
        }

        const newPurchase: Purchase = {
          ...purchaseDto,
          id: Date.now().toString(),
          purchaseNumber: this.generatePurchaseNumber(),
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        
        purchases.push(newPurchase)
        this.savePurchases(purchases)
        resolve(newPurchase)
      }, 100)
    })
  }

  async update(id: string, purchaseDto: UpdatePurchaseDto): Promise<Purchase> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const purchases = this.getPurchases()
        const index = purchases.findIndex((p) => p.id === id)
        if (index === -1) {
          reject(new Error('Purchase not found'))
          return
        }
        
        const updatedPurchase: Purchase = {
          ...purchases[index],
          ...purchaseDto,
          updatedAt: new Date(),
        }
        
        purchases[index] = updatedPurchase
        this.savePurchases(purchases)
        resolve(updatedPurchase)
      }, 100)
    })
  }

  async delete(id: string): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const purchases = this.getPurchases()
        const filteredPurchases = purchases.filter((p) => p.id !== id)
        this.savePurchases(filteredPurchases)
        resolve()
      }, 100)
    })
  }

  async getPurchasesByDateRange(startDate: Date, endDate: Date): Promise<Purchase[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const purchases = this.getPurchases()
        const filteredPurchases = purchases.filter((purchase) => {
          const purchaseDate = new Date(purchase.createdAt)
          return purchaseDate >= startDate && purchaseDate <= endDate
        })
        resolve(filteredPurchases)
      }, 100)
    })
  }

  async getPurchaseSummary(startDate: Date, endDate: Date): Promise<PurchaseSummary> {
    return new Promise((resolve) => {
      setTimeout(async () => {
        const purchases = await this.getPurchasesByDateRange(startDate, endDate)
        const completedPurchases = purchases.filter(p => p.status === 'completed')
        
        const totalPurchases = completedPurchases.length
        const totalAmount = completedPurchases.reduce((sum, purchase) => sum + purchase.totalAmount, 0)
        
        let totalItems = 0
        for (const purchase of completedPurchases) {
          for (const item of purchase.items) {
            totalItems += item.quantity
          }
        }
        
        resolve({
          totalPurchases,
          totalAmount,
          totalItems
        })
      }, 100)
    })
  }

  async getRecommendations(): Promise<PurchaseRecommendation> {
    // Mock implementation - trả về empty recommendations
    return {
      highPriority: [],
      mediumPriority: [],
      lowPriority: [],
      generatedAt: new Date().toISOString(),
    }
  }

  async getHighPriorityRecommendations(): Promise<PurchaseRecommendationItem[]> {
    return []
  }

  async getLowPriorityRecommendations(): Promise<PurchaseRecommendationItem[]> {
    return []
  }
}
