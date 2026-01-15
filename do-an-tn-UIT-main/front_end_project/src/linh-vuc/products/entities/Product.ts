/**
 * Product Entity - Domain Model
 * Đại diện cho sản phẩm trong hệ thống quản lý tạp hóa
 */

export interface Product {
  id: string
  name: string
  barcode?: string
  category: string
  importPrice: number // Giá nhập
  salePrice: number // Giá bán
  stock: number // Số lượng tồn kho
  unit: string // Đơn vị tính (kg, hộp, chai, v.v.)
  supplier: string
  description?: string
  imageUrl?: string // URL ảnh sản phẩm
  createdAt: Date
  updatedAt: Date
}

export type CreateProductDto = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateProductDto = Partial<CreateProductDto>

