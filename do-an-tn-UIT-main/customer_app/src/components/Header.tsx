import { useEffect, useState, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ShoppingCart, Bell, Package, ChevronRight } from 'lucide-react'
import { Button } from './Button'
import { UserMenu } from './UserMenu'
import { Card } from './Card'
import { Spinner } from './Spinner'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import { orderApi } from '@/api/orderApi'
import { Order } from '@/types'
import { formatDate, formatCurrency } from '@/utils/formatters'

const PENDING_COUNT_INTERVAL_MS = 60_000
const MAX_PENDING_IN_DROPDOWN = 5

export const Header = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { getTotalItems } = useCartStore()
  const { isAuthenticated } = useAuthStore()
  const [pendingCount, setPendingCount] = useState(0)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [pendingOrders, setPendingOrders] = useState<Order[]>([])
  const [loadingPending, setLoadingPending] = useState(false)
  const notificationRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      setPendingCount(0)
      setPendingOrders([])
      return
    }
    const fetchPending = async () => {
      try {
        const count = await orderApi.getPendingOrdersCount()
        setPendingCount(count)
      } catch {
        setPendingCount(0)
      }
    }
    fetchPending()
    const interval = setInterval(fetchPending, PENDING_COUNT_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [isAuthenticated])

  // Refresh badge khi vào trang Đơn hàng (sau khi tạo đơn mới)
  useEffect(() => {
    if (isAuthenticated && location.pathname === '/orders') {
      orderApi.getPendingOrdersCount().then(setPendingCount)
    }
  }, [isAuthenticated, location.pathname])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setNotificationOpen(false)
      }
    }
    if (notificationOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [notificationOpen])

  const openNotification = async () => {
    if (!isAuthenticated) {
      navigate('/orders', { state: { tab: 'pending' } })
      return
    }
    setNotificationOpen((prev) => !prev)
    if (!notificationOpen) {
      setLoadingPending(true)
      try {
        const list = await orderApi.getPendingOrders()
        setPendingOrders(list)
        setPendingCount(list.length)
      } catch {
        setPendingOrders([])
        setPendingCount(0)
      } finally {
        setLoadingPending(false)
      }
    }
  }

  const goToOrder = (orderId: string) => {
    setNotificationOpen(false)
    navigate(`/orders/${orderId}`)
  }

  const goToAllPending = () => {
    setNotificationOpen(false)
    navigate('/orders', { state: { tab: 'pending' } })
  }

  return (
    <header className="bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-700 dark:to-primary-800 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 
            className="text-2xl font-bold text-white cursor-pointer hover:text-primary-100 transition-colors"
            onClick={() => navigate('/')}
          >
            🛒 Cửa Hàng Tạp Hóa
          </h1>
          
          <div className="flex items-center gap-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/cart')}
              className="relative bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <ShoppingCart size={20} />
              {getTotalItems() > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {getTotalItems()}
                </span>
              )}
            </Button>

            {/* Chuông thông báo – dropdown danh sách đơn chờ xử lý + Xem tất cả */}
            <div className="relative" ref={notificationRef}>
              <Button
                variant="secondary"
                size="sm"
                onClick={openNotification}
                title={pendingCount > 0 ? `${pendingCount} đơn chờ xử lý` : 'Thông báo đơn hàng'}
                className="relative bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <Bell size={20} />
                {pendingCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full min-w-[1.25rem] h-5 px-1 flex items-center justify-center font-bold">
                    {pendingCount > 99 ? '99+' : pendingCount}
                  </span>
                )}
              </Button>

              {notificationOpen && (
                <Card className="absolute right-0 mt-2 w-80 z-[60] shadow-xl border border-gray-200 dark:border-gray-700">
                  <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <Package size={18} />
                      Đơn chờ xử lý
                    </h3>
                    {pendingCount > 0 && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {pendingCount} đơn chưa được xác nhận
                      </p>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {loadingPending ? (
                      <div className="py-6 flex justify-center">
                        <Spinner size="sm" />
                      </div>
                    ) : pendingOrders.length === 0 ? (
                      <div className="py-6 px-3 text-center text-sm text-gray-500 dark:text-gray-400">
                        Không có đơn chờ xử lý
                      </div>
                    ) : (
                      <ul className="py-1">
                        {pendingOrders.slice(0, MAX_PENDING_IN_DROPDOWN).map((order) => (
                          <li key={order.id}>
                            <button
                              type="button"
                              onClick={() => goToOrder(order.id)}
                              className="w-full px-3 py-2.5 text-left hover:bg-gray-100 dark:hover:bg-gray-700/50 flex items-center justify-between gap-2 transition-colors"
                            >
                              <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                Đơn #{order.id ? order.id.slice(0, 8) : 'N/A'}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">
                                {order.createdAt ? formatDate(order.createdAt) : ''}
                              </span>
                              <ChevronRight size={14} className="text-gray-400 shrink-0" />
                            </button>
                            <div className="px-3 pb-1 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                              <span>{order.customerInfo?.name || '—'}</span>
                              <span>{formatCurrency(order.totalAmount ?? 0)}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  {pendingOrders.length > 0 && (
                    <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={goToAllPending}
                        className="w-full bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-900/50"
                      >
                        Xem tất cả
                      </Button>
                    </div>
                  )}
                </Card>
              )}
            </div>
            
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/orders')}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              Đơn hàng
            </Button>

            {isAuthenticated ? (
              <UserMenu />
            ) : (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate('/login')}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                Đăng nhập
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
