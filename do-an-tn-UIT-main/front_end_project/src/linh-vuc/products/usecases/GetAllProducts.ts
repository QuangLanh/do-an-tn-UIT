/**
 * Use Case: Get All Products
 * Lấy danh sách tất cả sản phẩm
 */

import { Product } from '../entities/Product'
import { ProductService } from '../services/ProductService'

export class GetAllProductsUseCase {
  constructor(private readonly productService: ProductService) {}

  async execute(): Promise<Product[]> {
    return this.productService.getAllProducts()
  }
}

