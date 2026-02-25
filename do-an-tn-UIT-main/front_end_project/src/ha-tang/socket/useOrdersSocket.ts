import { useEffect } from 'react'
import { useAuthStore } from '@/kho-trang-thai/khoXacThuc'
import { connectOrdersSocket, disconnectOrdersSocket } from './ordersSocket'

/**
 * Hook khởi tạo socket cho đơn hàng khi user là admin/staff.
 * Dùng ở layout chính để đảm bảo luôn chạy khi đang trong khu vực quản trị.
 */
export const useOrdersSocket = () => {
  const { isAuthenticated, user } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated || !user || (user.role !== 'admin' && user.role !== 'staff')) {
      disconnectOrdersSocket()
      return
    }

    connectOrdersSocket()

    return () => {
      // Khi unmount hoặc đổi user/role: ngắt kết nối để tránh socket thừa
      disconnectOrdersSocket()
    }
  }, [isAuthenticated, user?.role])
}

