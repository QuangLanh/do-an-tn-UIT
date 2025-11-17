/**
 * Real Purchase Repository - API Implementation
 * Sử dụng API thực từ backend thay vì localStorage
 */

import { IPurchaseRepository } from './PurchaseRepository'
import {
  Purchase,
  CreatePurchaseDto,
  UpdatePurchaseDto,
  PurchaseSummary,
  PurchaseItem,
} from '../entities/Purchase'
import {
  PurchaseRecommendation,
  PurchaseRecommendationItem,
} from '../entities/PurchaseRecommendation'
import { Product } from '../../products/entities/Product'
import { apiService } from '@/ha-tang/api'

/**
 * Map backend purchase response to frontend Purchase entity
 */
function mapBackendToFrontend(backendPurchase: any): Purchase {
  const items: PurchaseItem[] = (backendPurchase.items || []).map((item: any) => {
    // Backend returns product as ObjectId or populated object
    const product: Product = item.product && typeof item.product === 'object'
      ? {
          id: item.product._id || item.product.id,
          name: item.product.name || item.productName,
          category: item.product.category || '',
          importPrice: item.product.purchasePrice || item.purchasePrice || 0,
          salePrice: item.product.salePrice || 0,
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
          importPrice: item.purchasePrice || 0,
          salePrice: 0,
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
      unitPrice: item.purchasePrice || item.unitPrice || 0,
      subtotal: item.subtotal || item.quantity * (item.purchasePrice || 0),
    }
  })

  return {
    id: backendPurchase._id || backendPurchase.id,
    purchaseNumber: backendPurchase.purchaseNumber || '',
    items,
    totalAmount: backendPurchase.total || backendPurchase.totalAmount || 0,
    supplierId: backendPurchase.supplierId,
    supplierName: backendPurchase.supplier || backendPurchase.supplierName || '',
    status: backendPurchase.status || 'pending',
    notes: backendPurchase.notes,
    createdAt: new Date(backendPurchase.createdAt || Date.now()),
    updatedAt: new Date(backendPurchase.updatedAt || Date.now()),
    completedAt: backendPurchase.completedAt ? new Date(backendPurchase.completedAt) : undefined,
  }
}

/**
 * Map frontend CreatePurchaseDto to backend DTO
 */
function mapFrontendToBackend(purchaseDto: CreatePurchaseDto | UpdatePurchaseDto): any {
  return {
    items: purchaseDto.items?.map((item: any) => ({
      productId: item.productId,
      quantity: item.quantity,
      purchasePrice: item.unitPrice,
    })),
    supplier: purchaseDto.supplierName,
    supplierContact: '',
    notes: purchaseDto.notes,
  }
}

/**
 * Map backend recommendation response to frontend PurchaseRecommendation
 */
function mapRecommendationToFrontend(backendRec: any): PurchaseRecommendation {
  const mapItem = (item: any): PurchaseRecommendationItem => ({
    productId: item.productId || item.product?._id || item.product?.id || '',
    productName: item.productName || item.product?.name || '',
    currentStock: item.currentStock || 0,
    minStockLevel: item.minStockLevel || 10,
    recommendedQuantity: item.recommendedQuantity || 0,
    priority: item.priority || 'medium',
    reason: item.reason || '',
    suggestedPurchasePrice: item.suggestedPurchasePrice || 0,
    averageDailySales: item.averageDailySales || 0,
    totalSoldLast30Days: item.totalSoldLast30Days || 0,
  })

  return {
    highPriority: (backendRec.highPriority || []).map(mapItem),
    mediumPriority: (backendRec.mediumPriority || []).map(mapItem),
    lowPriority: (backendRec.lowPriority || []).map(mapItem),
    generatedAt: backendRec.generatedAt || new Date().toISOString(),
  }
}

export class RealPurchaseRepository implements IPurchaseRepository {
  async findAll(): Promise<Purchase[]> {
    try {
      const response = await apiService.purchases.list()
      const purchases = Array.isArray(response) ? response : (response as any).data || response
      return Array.isArray(purchases)
        ? purchases.map(mapBackendToFrontend)
        : []
    } catch (error) {
      console.error('Error fetching purchases:', error)
      throw error
    }
  }

  async findById(id: string): Promise<Purchase | null> {
    try {
      const purchase = await apiService.purchases.detail(id)
      return purchase ? mapBackendToFrontend(purchase) : null
    } catch (error) {
      console.error('Error fetching purchase:', error)
      return null
    }
  }

  async create(purchaseDto: CreatePurchaseDto): Promise<Purchase> {
    try {
      const backendDto = mapFrontendToBackend(purchaseDto)
      const createdPurchase = await apiService.purchases.create(backendDto)
      return mapBackendToFrontend(createdPurchase)
    } catch (error) {
      console.error('Error creating purchase:', error)
      throw error
    }
  }

  async update(id: string, purchaseDto: UpdatePurchaseDto): Promise<Purchase> {
    try {
      const backendDto = mapFrontendToBackend(purchaseDto as CreatePurchaseDto)
      const updatedPurchase = await apiService.purchases.update(id, backendDto)
      return mapBackendToFrontend(updatedPurchase)
    } catch (error) {
      console.error('Error updating purchase:', error)
      throw error
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await apiService.purchases.delete(id)
    } catch (error) {
      console.error('Error deleting purchase:', error)
      throw error
    }
  }

  async getPurchasesByDateRange(startDate: Date, endDate: Date): Promise<Purchase[]> {
    try {
      const response = await apiService.purchases.list({
        from: startDate.toISOString().split('T')[0],
        to: endDate.toISOString().split('T')[0],
      })
      const purchases = Array.isArray(response) ? response : (response as any).data || response
      return Array.isArray(purchases)
        ? purchases.map(mapBackendToFrontend)
        : []
    } catch (error) {
      console.error('Error fetching purchases by date range:', error)
      throw error
    }
  }

  async getPurchaseSummary(startDate: Date, endDate: Date): Promise<PurchaseSummary> {
    try {
      const stats = await apiService.purchases.statistics({
        from: startDate.toISOString().split('T')[0],
        to: endDate.toISOString().split('T')[0],
      })

      return {
        totalPurchases: stats.totalPurchases || 0,
        totalAmount: stats.totalAmount || stats.totalCost || 0,
        totalItems: stats.totalItems || 0,
      }
    } catch (error) {
      console.error('Error fetching purchase summary:', error)
      throw error
    }
  }

  async getRecommendations(): Promise<PurchaseRecommendation> {
    try {
      const response = await apiService.purchases.recommendations()
      return mapRecommendationToFrontend(response)
    } catch (error) {
      console.error('Error fetching recommendations:', error)
      throw error
    }
  }

  async getHighPriorityRecommendations(): Promise<PurchaseRecommendationItem[]> {
    try {
      const response = await apiService.purchases.highPriorityRecommendations()
      const items = Array.isArray(response) ? response : []
      return items.map((item: any) => ({
        productId: item.productId || item.product?._id || '',
        productName: item.productName || item.product?.name || '',
        currentStock: item.currentStock || 0,
        minStockLevel: item.minStockLevel || 10,
        recommendedQuantity: item.recommendedQuantity || 0,
        priority: 'high',
        reason: item.reason || '',
        suggestedPurchasePrice: item.suggestedPurchasePrice || 0,
        averageDailySales: item.averageDailySales || 0,
        totalSoldLast30Days: item.totalSoldLast30Days || 0,
      }))
    } catch (error) {
      console.error('Error fetching high priority recommendations:', error)
      throw error
    }
  }

  async getLowPriorityRecommendations(): Promise<PurchaseRecommendationItem[]> {
    try {
      const response = await apiService.purchases.lowPriorityRecommendations()
      const items = Array.isArray(response) ? response : []
      return items.map((item: any) => ({
        productId: item.productId || item.product?._id || '',
        productName: item.productName || item.product?.name || '',
        currentStock: item.currentStock || 0,
        minStockLevel: item.minStockLevel || 10,
        recommendedQuantity: item.recommendedQuantity || 0,
        priority: 'low',
        reason: item.reason || '',
        suggestedPurchasePrice: item.suggestedPurchasePrice || 0,
        averageDailySales: item.averageDailySales || 0,
        totalSoldLast30Days: item.totalSoldLast30Days || 0,
      }))
    } catch (error) {
      console.error('Error fetching low priority recommendations:', error)
      throw error
    }
  }
}
