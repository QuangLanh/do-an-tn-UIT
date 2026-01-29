/**
 * Sidebar Store (Zustand)
 * Quản lý trạng thái sidebar (mở/đóng) và số đơn chờ xử lý (badge)
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apiService } from '@/ha-tang/api'

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
          const data = await apiService.orders.list({
            status: 'pending',
            isOnline: true,
          })
          const raw = Array.isArray(data) ? data : (data as any)?.data
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

