import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartItem, Product } from '@/types'
import toast from 'react-hot-toast'

interface CartState {
  items: CartItem[]
  
  // Actions
  addToCart: (product: Product, quantity?: number) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalAmount: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addToCart: (product: Product, quantity = 1) => {
        // Normalize product: ensure it has id (from _id if needed)
        const normalizedProduct: Product = {
          ...product,
          id: product.id || (product as any)._id || '',
        }

        // Validate product has ID
        if (!normalizedProduct || !normalizedProduct.id) {
          console.error('Invalid product:', product)
          toast.error('Sản phẩm không hợp lệ')
          return
        }

        const { items } = get()
        // Ensure we compare IDs as strings and they exist
        const productId = String(normalizedProduct.id).trim()
        
        // Only find existing item if both IDs exist and match
        const existingItemIndex = items.findIndex(item => {
          if (!item.product || !item.product.id) return false
          const itemId = String(item.product.id).trim()
          return itemId === productId && itemId !== '' && productId !== ''
        })

        if (existingItemIndex !== -1) {
          // Update quantity of existing item
          const updatedItems = items.map((item, index) => {
            if (index === existingItemIndex) {
              return { ...item, quantity: item.quantity + quantity }
            }
            return item
          })
          set({ items: updatedItems })
          toast.success(`Đã cập nhật số lượng ${normalizedProduct.name}`)
        } else {
          // Add new item - clone product to avoid reference issues
          set({
            items: [...items, { product: normalizedProduct, quantity }]
          })
          toast.success(`Đã thêm ${normalizedProduct.name} vào giỏ hàng`)
        }
      },

      removeFromCart: (productId: string) => {
        const { items } = get()
        const item = items.find(item => item.product.id === productId)
        
        set({
          items: items.filter(item => item.product.id !== productId)
        })
        
        if (item) {
          toast.success(`Đã xóa ${item.product.name} khỏi giỏ hàng`)
        }
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeFromCart(productId)
          return
        }

        set({
          items: get().items.map(item =>
            item.product.id === productId
              ? { ...item, quantity }
              : item
          )
        })
      },

      clearCart: () => {
        set({ items: [] })
        toast.success('Đã xóa toàn bộ giỏ hàng')
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },

      getTotalAmount: () => {
        return get().items.reduce(
          (total, item) => total + item.product.salePrice * item.quantity,
          0
        )
      },
    }),
    {
      name: 'customer-cart-storage',
    }
  )
)
