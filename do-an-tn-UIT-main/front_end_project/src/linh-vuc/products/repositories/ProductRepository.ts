/**
 * Product Repository Interface
 * Định nghĩa các phương thức tương tác với data source
 */

import { Product, CreateProductDto, UpdateProductDto } from '../entities/Product'

export interface IProductRepository {
  findAll(): Promise<Product[]>
  findById(id: string): Promise<Product | null>
  create(product: CreateProductDto): Promise<Product>
  update(id: string, product: UpdateProductDto): Promise<Product>
  delete(id: string): Promise<void>
  search(query: string): Promise<Product[]>
  findLowStock(threshold: number): Promise<Product[]>
}

/**
 * Mock Implementation - Sử dụng localStorage để simulate backend
 * @deprecated Use RealProductRepository instead for production
 */
export class ProductRepository implements IProductRepository {
  private readonly STORAGE_KEY = 'grocery_products'

  private getProducts(): Product[] {
    const data = localStorage.getItem(this.STORAGE_KEY)
    if (!data) {
      const initialProducts = this.getInitialProducts()
      this.saveProducts(initialProducts)
      return initialProducts
    }
    return JSON.parse(data).map((p: any) => ({
      ...p,
      createdAt: new Date(p.createdAt),
      updatedAt: new Date(p.updatedAt),
    }))
  }

  private saveProducts(products: Product[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(products))
  }

  private getInitialProducts(): Product[] {
    return [
      {
        id: '1',
        name: 'Gạo ST25',
        category: 'Thực phẩm khô',
        importPrice: 18000,
        salePrice: 22000,
        stock: 150,
        unit: 'kg',
        supplier: 'Nhà cung cấp A',
        description: 'Gạo ST25 thơm ngon',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
      {
        id: '2',
        name: 'Dầu ăn Neptune',
        category: 'Gia vị',
        importPrice: 35000,
        salePrice: 42000,
        stock: 80,
        unit: 'chai',
        supplier: 'Nhà cung cấp B',
        description: 'Dầu ăn cao cấp 1L',
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02'),
      },
      {
        id: '3',
        name: 'Mì gói Hảo Hảo',
        category: 'Thực phẩm khô',
        importPrice: 2500,
        salePrice: 3500,
        stock: 8,
        unit: 'gói',
        supplier: 'Nhà cung cấp C',
        description: 'Mì gói vị tôm chua cay',
        createdAt: new Date('2024-01-03'),
        updatedAt: new Date('2024-01-03'),
      },
      {
        id: '4',
        name: 'Nước ngọt Coca Cola',
        category: 'Đồ uống',
        importPrice: 8000,
        salePrice: 12000,
        stock: 120,
        unit: 'lon',
        supplier: 'Nhà cung cấp D',
        description: 'Coca Cola 330ml',
        createdAt: new Date('2024-01-04'),
        updatedAt: new Date('2024-01-04'),
      },
      {
        id: '5',
        name: 'Sữa tươi Vinamilk',
        category: 'Đồ uống',
        importPrice: 28000,
        salePrice: 35000,
        stock: 5,
        unit: 'hộp',
        supplier: 'Nhà cung cấp E',
        description: 'Sữa tươi 1L',
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date('2024-01-05'),
      },
      {
        id: '6',
        name: 'Trứng gà',
        category: 'Thực phẩm tươi sống',
        importPrice: 3000,
        salePrice: 4000,
        stock: 200,
        unit: 'quả',
        supplier: 'Nhà cung cấp F',
        description: 'Trứng gà tươi',
        createdAt: new Date('2024-01-06'),
        updatedAt: new Date('2024-01-06'),
      },
      {
        id: '7',
        name: 'Đường trắng',
        category: 'Gia vị',
        importPrice: 15000,
        salePrice: 19000,
        stock: 6,
        unit: 'kg',
        supplier: 'Nhà cung cấp A',
        description: 'Đường tinh luyện',
        createdAt: new Date('2024-01-07'),
        updatedAt: new Date('2024-01-07'),
      },
      {
        id: '8',
        name: 'Nước mắm Nam Ngư',
        category: 'Gia vị',
        importPrice: 25000,
        salePrice: 32000,
        stock: 45,
        unit: 'chai',
        supplier: 'Nhà cung cấp B',
        description: 'Nước mắm đặc biệt 500ml',
        createdAt: new Date('2024-01-08'),
        updatedAt: new Date('2024-01-08'),
      },
    ]
  }

  async findAll(): Promise<Product[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(this.getProducts()), 100)
    })
  }

  async findById(id: string): Promise<Product | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const products = this.getProducts()
        const product = products.find((p) => p.id === id)
        resolve(product || null)
      }, 100)
    })
  }

  async create(productDto: CreateProductDto): Promise<Product> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const products = this.getProducts()
        const newProduct: Product = {
          ...productDto,
          id: Date.now().toString(),
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        products.push(newProduct)
        this.saveProducts(products)
        resolve(newProduct)
      }, 100)
    })
  }

  async update(id: string, productDto: UpdateProductDto): Promise<Product> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const products = this.getProducts()
        const index = products.findIndex((p) => p.id === id)
        if (index === -1) {
          reject(new Error('Product not found'))
          return
        }
        const updatedProduct: Product = {
          ...products[index],
          ...productDto,
          updatedAt: new Date(),
        }
        products[index] = updatedProduct
        this.saveProducts(products)
        resolve(updatedProduct)
      }, 100)
    })
  }

  async delete(id: string): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const products = this.getProducts()
        const filteredProducts = products.filter((p) => p.id !== id)
        this.saveProducts(filteredProducts)
        resolve()
      }, 100)
    })
  }

  async search(query: string): Promise<Product[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const products = this.getProducts()
        const lowercaseQuery = query.toLowerCase()
        const filtered = products.filter(
          (p) =>
            p.name.toLowerCase().includes(lowercaseQuery) ||
            p.category.toLowerCase().includes(lowercaseQuery) ||
            p.supplier.toLowerCase().includes(lowercaseQuery)
        )
        resolve(filtered)
      }, 100)
    })
  }

  async findLowStock(threshold: number = 10): Promise<Product[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const products = this.getProducts()
        const lowStockProducts = products.filter((p) => p.stock < threshold)
        resolve(lowStockProducts)
      }, 100)
    })
  }
}

