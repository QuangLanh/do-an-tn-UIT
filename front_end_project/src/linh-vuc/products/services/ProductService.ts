/**
 * Product Service - Business Logic Layer
 * Xử lý các nghiệp vụ liên quan đến sản phẩm
 */

import { Product, CreateProductDto, UpdateProductDto } from '../entities/Product'
import { IProductRepository } from '../repositories/ProductRepository'

export class ProductService {
  constructor(private readonly repository: IProductRepository) {}

  async getAllProducts(): Promise<Product[]> {
    return this.repository.findAll()
  }

  async getProductById(id: string): Promise<Product | null> {
    return this.repository.findById(id)
  }

  async getProductByBarcode(barcode: string): Promise<Product | null> {
    return this.repository.findByBarcode(barcode)
  }

  async createProduct(productDto: CreateProductDto): Promise<Product> {
    // Validate business rules
    if (productDto.salePrice <= productDto.importPrice) {
      throw new Error('Giá bán phải lớn hơn giá nhập')
    }
    if (productDto.stock < 0) {
      throw new Error('Số lượng tồn kho không được âm')
    }
    return this.repository.create(productDto)
  }

  async updateProduct(id: string, productDto: UpdateProductDto): Promise<Product> {
    // Validate if updating prices
    if (productDto.salePrice && productDto.importPrice) {
      if (productDto.salePrice <= productDto.importPrice) {
        throw new Error('Giá bán phải lớn hơn giá nhập')
      }
    }
    return this.repository.update(id, productDto)
  }

  async deleteProduct(id: string): Promise<void> {
    return this.repository.delete(id)
  }

  async searchProducts(query: string): Promise<Product[]> {
    return this.repository.search(query)
  }

  async getLowStockProducts(threshold: number = 10): Promise<Product[]> {
    return this.repository.findLowStock(threshold)
  }

  calculateProfit(product: Product): number {
    return product.salePrice - product.importPrice
  }

  calculateProfitMargin(product: Product): number {
    return ((product.salePrice - product.importPrice) / product.importPrice) * 100
  }

  calculateInventoryValue(products: Product[]): number {
    return products.reduce((total, product) => {
      return total + product.importPrice * product.stock
    }, 0)
  }
}

