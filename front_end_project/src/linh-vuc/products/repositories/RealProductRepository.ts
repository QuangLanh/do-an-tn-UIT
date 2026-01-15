/**
 * Real Product Repository - API Implementation
 * Sử dụng API thực từ backend thay vì localStorage
 */

import { IProductRepository } from './ProductRepository'
import { Product, CreateProductDto, UpdateProductDto } from '../entities/Product'
import { apiService } from '@/ha-tang/api'

/**
 * Map backend product response to frontend Product entity
 */
function mapBackendToFrontend(backendProduct: any): Product {
  return {
    id: backendProduct._id || backendProduct.id,
    name: backendProduct.name,
    barcode: backendProduct.barcode,
    category: backendProduct.category || '',
    importPrice: backendProduct.purchasePrice ?? backendProduct.importPrice ?? 0,
    salePrice: backendProduct.salePrice ?? 0,
    stock: backendProduct.stock || 0,
    unit: backendProduct.unit || '',
    supplier: backendProduct.supplier || '',
    description: backendProduct.description,
    imageUrl: backendProduct.imageUrl,
    createdAt: new Date(backendProduct.createdAt || Date.now()),
    updatedAt: new Date(backendProduct.updatedAt || Date.now()),
  }
}

/**
 * Map frontend Product to backend create/update DTO
 */
function mapFrontendToBackend(product: CreateProductDto | UpdateProductDto): any {
  const dto: any = {
    name: product.name,
    category: product.category,
    purchasePrice: (product as any).importPrice ?? (product as any).purchasePrice,
    salePrice: product.salePrice,
    stock: product.stock ?? 0,
    unit: product.unit,
    description: product.description,
  }

  // Add optional fields if they exist
  if ('supplier' in product) {
    // Backend doesn't have supplier field in schema, but we'll keep it for compatibility
  }

  // Add imageUrl if it exists
  if ('imageUrl' in product && product.imageUrl) {
    dto.imageUrl = product.imageUrl
  }

  // Add barcode if it exists
  if ('barcode' in product && (product as any).barcode) {
    dto.barcode = (product as any).barcode
  }

  return dto
}

export class RealProductRepository implements IProductRepository {
  async findAll(): Promise<Product[]> {
    try {
      const response = await apiService.products.list()
      const products = Array.isArray(response) ? response : (response as any).data || response
      return Array.isArray(products) 
        ? products.map(mapBackendToFrontend)
        : []
    } catch (error) {
      console.error('Error fetching products:', error)
      throw error
    }
  }

  async findById(id: string): Promise<Product | null> {
    try {
      const product = await apiService.products.detail(id)
      return product ? mapBackendToFrontend(product) : null
    } catch (error) {
      console.error('Error fetching product:', error)
      return null
    }
  }

  async findByBarcode(barcode: string): Promise<Product | null> {
    try {
      const product = await (apiService.products as any).byBarcode(barcode)
      return product ? mapBackendToFrontend(product) : null
    } catch (error) {
      console.error('Error fetching product by barcode:', error)
      return null
    }
  }

  async create(productDto: CreateProductDto): Promise<Product> {
    try {
      const backendDto = mapFrontendToBackend(productDto)
      // Add required fields for backend
      if (!backendDto.sku) {
        backendDto.sku = `SKU-${Date.now()}`
      }
      if (backendDto.minStockLevel === undefined) {
        backendDto.minStockLevel = 10
      }
      
      const createdProduct = await apiService.products.create(backendDto)
      return mapBackendToFrontend(createdProduct)
    } catch (error) {
      console.error('Error creating product:', error)
      throw error
    }
  }

  async update(id: string, productDto: UpdateProductDto): Promise<Product> {
    try {
      const backendDto = mapFrontendToBackend(productDto)
      const updatedProduct = await apiService.products.update(id, backendDto)
      return mapBackendToFrontend(updatedProduct)
    } catch (error) {
      console.error('Error updating product:', error)
      throw error
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await apiService.products.delete(id)
    } catch (error) {
      console.error('Error deleting product:', error)
      throw error
    }
  }

  async search(query: string): Promise<Product[]> {
    try {
      const response = await apiService.products.list({ search: query })
      const products = Array.isArray(response) ? response : (response as any).data || response
      return Array.isArray(products) 
        ? products.map(mapBackendToFrontend)
        : []
    } catch (error) {
      console.error('Error searching products:', error)
      throw error
    }
  }

  async findLowStock(threshold: number = 10): Promise<Product[]> {
    try {
      const response = await apiService.products.lowStock()
      const products = Array.isArray(response) ? response : (response as any).data || response
      return Array.isArray(products) 
        ? products.map(mapBackendToFrontend).filter(p => p.stock < threshold)
        : []
    } catch (error) {
      console.error('Error fetching low stock products:', error)
      throw error
    }
  }
}

