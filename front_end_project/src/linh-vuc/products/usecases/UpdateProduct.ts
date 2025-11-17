/**
 * Use Case: Update Product
 * Cập nhật thông tin sản phẩm
 */

import { Product, UpdateProductDto } from '../entities/Product'
import { ProductService } from '../services/ProductService'

export class UpdateProductUseCase {
  constructor(private readonly productService: ProductService) {}

  async execute(id: string, productDto: UpdateProductDto): Promise<Product> {
    return this.productService.updateProduct(id, productDto)
  }
}

