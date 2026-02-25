/**
 * Sidebar Store (Zustand)
 * Quản lý trạng thái sidebar (mở/đóng) và số đơn chờ xử lý (badge)
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { API_ENDPOINTS, apiClient } from '@/ha-tang/api'

interface SidebarState {
  isOpen: boolean
  toggle: () => void
  open: () => void
  close: () => void
  /** Số đơn online chờ xử lý (pending) – dùng cho badge "Danh sách đơn đặt hàng" */
  pendingOrdersCount: number
  /** Gọi lại API và cập nhật pendingOrdersCount (sau khi đổi trạng thái đơn hàng không cần reload trang) */
  refreshPendingOrdersCount: () => Promise<void>
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      isOpen: true,

      toggle: () => set((state) => ({ isOpen: !state.isOpen })),

      open: () => set({ isOpen: true }),

      close: () => set({ isOpen: false }),

      pendingOrdersCount: 0,

      refreshPendingOrdersCount: async () => {
        try {
          // Gọi API trực tiếp và đánh dấu skipGlobalLoading để không bật spinner toàn cục
          const url = API_ENDPOINTS.orders.list({
            status: 'pending',
            isOnline: true,
          })
          const response = await apiClient.get(url, {
            // Thuộc tính custom, interceptor sẽ đọc để bỏ qua spinner
            // (đã khai báo trong LoadingAwareConfig)
            skipGlobalLoading: true as any,
          } as any)

          const raw = Array.isArray(response.data) ? response.data : (response as any)?.data
          const list = Array.isArray(raw) ? raw : []
          const count = list.length
          set({ pendingOrdersCount: count })
        } catch {
          set({ pendingOrdersCount: 0 })
        }
      },
    }),
    {
      name: 'sidebar-storage',
      partialize: (state) => ({ isOpen: state.isOpen }),
    }
  )
)

