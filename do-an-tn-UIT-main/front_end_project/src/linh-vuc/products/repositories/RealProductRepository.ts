/**
 * Real Product Repository - API Implementation
 * Sử dụng API thực từ backend thay vì localStorage
 */

import { IProductRepository } from './ProductRepository'
import { Product, CreateProductDto, UpdateProductDto } from '../entities/Product'
import { apiService } from '@/ha-tang/api'

/**
 * Map backend product response to frontend Product entity
 * Hỗ trợ nhiều định dạng: wrapped (data), Mongoose doc, plain object
 */
function mapBackendToFrontend(backendProduct: any): Product {
  // Nếu response bọc trong { data: product } hoặc { product: product }
  const raw = backendProduct?.data ?? backendProduct?.product ?? backendProduct
  if (!raw || typeof raw !== 'object') {
    return {
      id: backendProduct?._id || backendProduct?.id,
      name: '',
      barcode: '',
      category: '',
      importPrice: 0,
      salePrice: 0,
      stock: 0,
      unit: '',
      supplier: '',
      description: '',
      imageUrl: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  }
  const p = raw
  return {
    id: p._id?.toString?.() || p._id || p.id,
    name: p.name ?? '',
    barcode: p.barcode ?? '',
    category: p.category ?? '',
    importPrice: Number(p.purchasePrice ?? p.importPrice ?? 0),
    salePrice: Number(p.salePrice ?? p.price ?? 0),
    stock: Number(p.stock ?? 0),
    unit: p.unit ?? '',
    supplier: p.supplier ?? '',
    description: p.description ?? '',
    imageUrl: p.imageUrl ?? '',
    createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
    updatedAt: p.updatedAt ? new Date(p.updatedAt) : new Date(),
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
    supplier: (product as any).supplier,
    description: product.description,
  }

  // Add barcode if it exists
  if ('barcode' in product && (product as any).barcode) {
    dto.barcode = (product as any).barcode
  }

  // Add imageUrl if it exists
  if ('imageUrl' in product && product.imageUrl) {
    dto.imageUrl = product.imageUrl
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

  async findById(id: string, noCache = true): Promise<Product | null> {
    try {
      const product = await apiService.products.detail(id, noCache)
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

