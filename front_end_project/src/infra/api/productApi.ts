/**
 * Product API
 * Factory pattern để tạo các use cases và services
 */

import { RealProductRepository } from '@/domains/products/repositories/RealProductRepository'
import { ProductService } from '@/domains/products/services/ProductService'
import { GetAllProductsUseCase } from '@/domains/products/usecases/GetAllProducts'
import { CreateProductUseCase } from '@/domains/products/usecases/CreateProduct'
import { UpdateProductUseCase } from '@/domains/products/usecases/UpdateProduct'
import { DeleteProductUseCase } from '@/domains/products/usecases/DeleteProduct'

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

