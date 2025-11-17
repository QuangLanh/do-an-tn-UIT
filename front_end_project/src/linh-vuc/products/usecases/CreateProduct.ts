/**
 * Use Case: Create Product
 * Tạo sản phẩm mới
 */

import { Product, CreateProductDto } from '../entities/Product'
import { ProductService } from '../services/ProductService'

export class CreateProductUseCase {
  constructor(private readonly productService: ProductService) {}

  async execute(productDto: CreateProductDto): Promise<Product> {
    return this.productService.createProduct(productDto)
  }
}

