import { useEffect, useState, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Package, Search, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Card } from '@/components/Card'
import { Badge } from '@/components/Badge'
import { Spinner } from '@/components/Spinner'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { useAuthStore } from '@/store/authStore'
import { orderApi } from '@/api/orderApi'
import { Order, OrderStatus } from '@/types'
import { formatCurrency, formatDate, getOrderStatusText, getOrderStatusVariant } from '@/utils/formatters'
import toast from 'react-hot-toast'

type TabType = 'all' | 'pending' | 'shipping' | 'completed' | 'cancelled'

const OrderCard = ({ order, onOrderClick }: { order: Order; onOrderClick: (orderId: string) => void }) => {
  const [showAllItems, setShowAllItems] = useState(false)
  const maxVisibleItems = 3
  const hasMoreItems = order.items && order.items.length > maxVisibleItems
  const visibleItems = showAllItems 
    ? order.items 
    : (order.items || []).slice(0, maxVisibleItems)

  return (
    <Card>
      <div className="space-y-4">
        {/* Order Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 
              className="font-semibold text-lg text-gray-900 dark:text-white cursor-pointer hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              onClick={() => onOrderClick(order.id)}
            >
              Đơn hàng #{order.id ? order.id.slice(0, 8) : 'N/A'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {order.createdAt ? formatDate(order.createdAt) : 'N/A'}
            </p>
          </div>
          <Badge variant={getOrderStatusVariant(order.status)}>
            {getOrderStatusText(order.status)}
          </Badge>
        </div>

        {/* Customer Info */}
        <div className="text-sm space-y-1">
          <p className="text-gray-600 dark:text-gray-400">
            <strong>Người nhận:</strong> {order.customerInfo?.name || 'N/A'}
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            <strong>SĐT:</strong> {order.customerInfo?.phone || 'N/A'}
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            <strong>Địa chỉ:</strong> {order.customerInfo?.address || 'N/A'}
          </p>
        </div>

        {/* Order Items */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Sản phẩm:
          </p>
          <div className="space-y-1">
            {visibleItems && visibleItems.length > 0 ? (
              visibleItems.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    {item.productName} x {item.quantity}
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {formatCurrency((item.price || 0) * (item.quantity || 0))}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">Không có sản phẩm</p>
            )}
          </div>
          
          {/* Show More/Less Button */}
          {hasMoreItems && (
            <button
              onClick={() => setShowAllItems(!showAllItems)}
              className="mt-2 text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
            >
              {showAllItems ? (
                <>
                  <ChevronUp size={16} />
                  Thu gọn
                </>
              ) : (
                <>
                  <ChevronDown size={16} />
                  Xem thêm ({order.items.length - maxVisibleItems} sản phẩm)
                </>
              )}
            </button>
          )}
        </div>

        {/* Order Total */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between items-center">
          <span className="font-semibold text-gray-900 dark:text-white">
            Tổng cộng:
          </span>
          <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
            {formatCurrency(order.totalAmount || 0)}
          </span>
        </div>

        {/* Payment Info */}
        <div className="flex gap-2 text-sm">
          <Badge variant={order.paymentStatus === 'paid' ? 'success' : 'warning'}>
            {order.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
          </Badge>
          <Badge variant="info">
            {order.paymentMethod === 'cash' ? 'Tiền mặt' : 'Chuyển khoản'}
          </Badge>
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="text-sm bg-gray-50 dark:bg-gray-700 p-3 rounded">
            <strong>Ghi chú:</strong> {order.notes}
          </div>
        )}
      </div>
    </Card>
  )
}

export const OrdersPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuthStore()

  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchPhone, setSearchPhone] = useState('')
  const [activeTab, setActiveTab] = useState<TabType>('completed') // Mặc định tab "hoàn thành"

  useEffect(() => {
    const stateTab = (location.state as { tab?: TabType })?.tab
    if (stateTab && ['all', 'pending', 'shipping', 'completed', 'cancelled'].includes(stateTab)) {
      setActiveTab(stateTab)
    }
  }, [location.state])

  useEffect(() => {
    if (isAuthenticated) {
      loadMyOrders()
    }
  }, [isAuthenticated])

  const loadMyOrders = async () => {
    setIsLoading(true)
    try {
      const data = await orderApi.getMyOrders()
      setOrders(data)
    } catch (error) {
      toast.error('Không thể tải danh sách đơn hàng')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearchByPhone = async () => {
    if (!searchPhone.trim()) {
      toast.error('Vui lòng nhập số điện thoại')
      return
    }

    setIsLoading(true)
    try {
      const data = await orderApi.getOrdersByPhone(searchPhone)
      setOrders(data)
      if (data.length === 0) {
        toast('Không tìm thấy đơn hàng nào')
      }
    } catch (error) {
      toast.error('Không thể tìm kiếm đơn hàng')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOrderClick = (orderId: string) => {
    navigate(`/orders/${orderId}`)
  }

  // Filter orders by active tab
  const filteredOrders = useMemo(() => {
    if (activeTab === 'all') {
      return orders
    }
    
    const statusMap: Record<TabType, OrderStatus | OrderStatus[]> = {
      all: [],
      pending: 'pending',
      shipping: 'shipping',
      completed: 'completed',
      cancelled: 'cancelled',
    }

    const targetStatus = statusMap[activeTab]
    if (!targetStatus) return orders

    return orders.filter(order => {
      if (Array.isArray(targetStatus)) {
        return targetStatus.includes(order.status)
      }
      return order.status === targetStatus
    })
  }, [orders, activeTab])

  const tabs: { id: TabType; label: string }[] = [
    { id: 'all', label: 'Tất cả' },
    { id: 'pending', label: 'Chờ xử lý' },
    { id: 'shipping', label: 'Đang vận chuyển' },
    { id: 'completed', label: 'Hoàn thành' },
    { id: 'cancelled', label: 'Đã hủy' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header />
      <div className="flex-1 py-8">
        <div className="max-w-4xl mx-auto px-4">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft size={16} className="mr-2" />
          Trang chủ
        </Button>

        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
          Đơn hàng của bạn
        </h1>

        {/* Tabs */}
        {orders.length > 0 && (
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Search Mode Toggle */}
        {!isAuthenticated && (
          <Card className="mb-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tra cứu đơn hàng
                </label>
                <div className="flex gap-3">
                  <Input
                    type="tel"
                    value={searchPhone}
                    onChange={(e) => setSearchPhone(e.target.value)}
                    placeholder="Nhập số điện thoại"
                    className="flex-1"
                  />
                  <Button onClick={handleSearchByPhone} isLoading={isLoading}>
                    <Search size={16} className="mr-2" />
                    Tìm kiếm
                  </Button>
                </div>
              </div>

              <div className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Lưu ý:</strong> Đăng nhập để xem tất cả đơn hàng của bạn
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate('/login')}
                  className="ml-2"
                >
                  Đăng nhập
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Orders List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <Card className="text-center py-12">
            <Package size={64} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              Chưa có đơn hàng nào
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {isAuthenticated 
                ? `Bạn chưa có đơn hàng nào ở trạng thái "${tabs.find(t => t.id === activeTab)?.label}"`
                : 'Nhập số điện thoại để tra cứu đơn hàng'}
            </p>
            <Button onClick={() => navigate('/')}>
              Bắt đầu mua sắm
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <OrderCard 
                key={order.id} 
                order={order} 
                onOrderClick={handleOrderClick}
              />
            ))}
          </div>
        )}
        </div>
      </div>
      <Footer />
    </div>
  )
}
