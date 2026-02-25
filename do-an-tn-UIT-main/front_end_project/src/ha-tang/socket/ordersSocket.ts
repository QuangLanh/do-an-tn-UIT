import { io, Socket } from 'socket.io-client'
import { useAuthStore } from '@/kho-trang-thai/khoXacThuc'
import { useSidebarStore } from '@/kho-trang-thai/khoThanhBen'

let socket: Socket | null = null

function getBaseSocketUrl(): string {
  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'
  // Bỏ đuôi /api để socket kết nối trực tiếp vào server Nest
  return apiBase.replace(/\/api\/?$/, '')
}

export function connectOrdersSocket() {
  if (socket || typeof window === 'undefined') return

  const { token, user } = useAuthStore.getState()
  // Chỉ admin/staff mới cần nhận thông báo đơn
  if (!user || (user.role !== 'admin' && user.role !== 'staff')) return

  const url = `${getBaseSocketUrl()}/orders`

  socket = io(url, {
    transports: ['websocket'],
    auth: token ? { token } : undefined,
  })

  const { refreshPendingOrdersCount } = useSidebarStore.getState()

  socket.on('connect', () => {
    // Kết nối thành công, có thể thêm log nếu cần
    // console.debug('Orders socket connected', socket?.id)
  })

  // Khi có đơn mới hoặc đơn được cập nhật, chỉ cần refresh lại badge 1 lần
  const handleOrderChange = async () => {
    try {
      await refreshPendingOrdersCount()
    } catch {
      // Im lặng, không làm ảnh hưởng UI
    }
  }

  socket.on('order.created', handleOrderChange)
  socket.on('order.updated', handleOrderChange)
}

export function disconnectOrdersSocket() {
  if (socket) {
    socket.off('order.created')
    socket.off('order.updated')
    socket.disconnect()
    socket = null
  }
}

