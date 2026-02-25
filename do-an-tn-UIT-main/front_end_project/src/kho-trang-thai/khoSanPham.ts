/**
 * Product Store (Zustand)
 * Cache danh sách sản phẩm dùng chung cho nhiều trang
 * Mục tiêu: chỉ gọi API getAllProducts ít lần nhất có thể,
 * giúp chuyển trang gần như tức thì sau lần tải đầu tiên.
 */

import { create } from 'zustand'
import { Product } from '@/linh-vuc/products/entities/Product'
import { productApi } from '@/ha-tang/api/productApi'

interface ProductState {
  products: Product[]
  isLoading: boolean
  error: string | null
  lastFetchedAt: number | null
  /**
   * Tải danh sách sản phẩm.
   * - Mặc định: dùng cache trong ~60 giây để tránh gọi API lặp lại.
   * - force = true: luôn gọi lại API (dùng sau khi thêm/xóa/sửa sản phẩm).
   */
  loadProducts: (force?: boolean) => Promise<Product[]>
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  isLoading: false,
  error: null,
  lastFetchedAt: null,

  async loadProducts(force = false) {
    const { isLoading, lastFetchedAt, products } = get()
    const now = Date.now()
    const CACHE_DURATION_MS = 60_000 // 1 phút

    // Nếu đã có dữ liệu gần đây và không bắt buộc refresh → dùng cache
    if (!force && products.length > 0 && lastFetchedAt && now - lastFetchedAt < CACHE_DURATION_MS) {
      return products
    }

    // Nếu đang tải rồi thì trả về dữ liệu hiện tại
    if (isLoading) {
      return products
    }

    set({ isLoading: true, error: null })
    try {
      const data = await productApi.getAllProducts.execute()
      set({
        products: data,
        isLoading: false,
        lastFetchedAt: Date.now(),
        error: null,
      })
      return data
    } catch (error: any) {
      const message = error?.message || 'Không thể tải danh sách sản phẩm'
      set({
        isLoading: false,
        error: message,
      })
      throw error
    }
  },
}))

