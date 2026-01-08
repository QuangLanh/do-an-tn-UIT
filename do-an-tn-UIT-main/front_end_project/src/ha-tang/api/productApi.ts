/**
 * Product API
 * Factory pattern để tạo các use cases và services
 */

import { RealProductRepository } from '@/linh-vuc/products/repositories/RealProductRepository'
import { ProductService } from '@/linh-vuc/products/services/ProductService'
import { GetAllProductsUseCase } from '@/linh-vuc/products/usecases/GetAllProducts'
import { CreateProductUseCase } from '@/linh-vuc/products/usecases/CreateProduct'
import { UpdateProductUseCase } from '@/linh-vuc/products/usecases/UpdateProduct'
import { DeleteProductUseCase } from '@/linh-vuc/products/usecases/DeleteProduct'

// Singleton instances - Using RealProductRepository for API calls
const productRepository = new RealProductRepository()
const productService = new ProductService(productRepository)

export const productApi = {
  getAllProducts: new GetAllProductsUseCase(productService),
  createProduct: new CreateProductUseCase(productService),
  updateProduct: new UpdateProductUseCase(productService),
  deleteProduct: new DeleteProductUseCase(productService),
  service: productService,
}

