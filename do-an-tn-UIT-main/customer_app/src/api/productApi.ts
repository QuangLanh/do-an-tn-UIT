import apiClient from './client'
import { Product } from '@/types'

// Helper function to normalize product (convert _id to id)
const normalizeProduct = (product: any): Product => {
  if (!product) return product
  return {
    ...product,
    id: product.id || product._id || '',
  }
}

export const productApi = {
  // Get all products
  getAllProducts: async (): Promise<Product[]> => {
    const response = await apiClient.get('/products')
    const products = Array.isArray(response.data) ? response.data : []
    return products.map(normalizeProduct)
  },

  // Get product by ID
  getProductById: async (id: string): Promise<Product> => {
    const response = await apiClient.get(`/products/${id}`)
    return normalizeProduct(response.data)
  },

  // Search products
  searchProducts: async (query: string): Promise<Product[]> => {
    const response = await apiClient.get('/products', {
      params: { search: query }
    })
    const products = Array.isArray(response.data) ? response.data : []
    return products.map(normalizeProduct)
  },

  // Get products by category
  getProductsByCategory: async (category: string): Promise<Product[]> => {
    const response = await apiClient.get('/products', {
      params: { category }
    })
    const products = Array.isArray(response.data) ? response.data : []
    return products.map(normalizeProduct)
  },

  // Get all categories
  getCategories: async (): Promise<string[]> => {
    const response = await apiClient.get('/products/categories')
    return response.data
  },
}
