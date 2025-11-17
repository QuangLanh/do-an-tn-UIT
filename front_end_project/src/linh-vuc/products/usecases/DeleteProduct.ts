/**
 * Use Case: Delete Product
 * Xóa sản phẩm
 */

import { ProductService } from '../services/ProductService'

export class DeleteProductUseCase {
  constructor(private readonly productService: ProductService) {}

  async execute(id: string): Promise<void> {
    return this.productService.deleteProduct(id)
  }
}

