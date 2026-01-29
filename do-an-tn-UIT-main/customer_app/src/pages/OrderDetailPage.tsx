import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Package } from 'lucide-react'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { Badge } from '@/components/Badge'
import { Spinner } from '@/components/Spinner'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { orderApi } from '@/api/orderApi'
import { Order } from '@/types'
import { formatCurrency, formatDate, getOrderStatusText, getOrderStatusVariant } from '@/utils/formatters'
import toast from 'react-hot-toast'

export const OrderDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (id) {
      loadOrder(id)
    }
  }, [id])

  const loadOrder = async (orderId: string) => {
    setIsLoading(true)
    try {
      const data = await orderApi.getOrderById(orderId)
      setOrder(data)
    } catch (error) {
      toast.error('Không thể tải thông tin đơn hàng')
      navigate('/orders')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Spinner size="lg" />
        </div>
        <Footer />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        <Header />
        <div className="flex-1 py-8">
          <div className="max-w-4xl mx-auto px-4">
            <Card className="text-center py-12">
              <Package size={64} className="mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Không tìm thấy đơn hàng
              </h3>
              <Button onClick={() => navigate('/orders')} className="mt-4">
                Quay lại danh sách đơn hàng
              </Button>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header />
      <div className="flex-1 py-8">
        <div className="max-w-4xl mx-auto px-4">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate('/orders')}
          className="mb-6"
        >
          <ArrowLeft size={16} className="mr-2" />
          Quay lại
        </Button>

        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
          Chi tiết đơn hàng
        </h1>

        <Card>
          <div className="space-y-6">
            {/* Order Header */}
            <div className="flex items-start justify-between border-b border-gray-200 dark:border-gray-700 pb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Đơn hàng #{order.id ? order.id.slice(0, 8) : 'N/A'}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Ngày đặt: {order.createdAt ? formatDate(order.createdAt) : 'N/A'}
                </p>
              </div>
              <Badge variant={getOrderStatusVariant(order.status)}>
                {getOrderStatusText(order.status)}
              </Badge>
            </div>

            {/* Customer Info */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <h3 className="font-semibold text-lg mb-3 text-gray-900 dark:text-white">
                Thông tin người nhận
              </h3>
              <div className="space-y-2 text-sm">
                <p className="text-gray-600 dark:text-gray-400">
                  <strong>Tên:</strong> {order.customerInfo?.name || 'N/A'}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  <strong>SĐT:</strong> {order.customerInfo?.phone || 'N/A'}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  <strong>Địa chỉ:</strong> {order.customerInfo?.address || 'N/A'}
                </p>
              </div>
            </div>

            {/* Order Items */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <h3 className="font-semibold text-lg mb-3 text-gray-900 dark:text-white">
                Sản phẩm ({order.items?.length || 0})
              </h3>
              <div className="space-y-2">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {item.productName}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Số lượng: {item.quantity} | Đơn giá: {formatCurrency(item.price || 0)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {formatCurrency((item.price || 0) * (item.quantity || 0))}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Không có sản phẩm</p>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-lg">
                <span className="font-semibold text-gray-900 dark:text-white">
                  Tổng cộng:
                </span>
                <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {formatCurrency(order.totalAmount || 0)}
                </span>
              </div>

              <div className="flex gap-2">
                <Badge variant={order.paymentStatus === 'paid' ? 'success' : 'warning'}>
                  {order.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                </Badge>
                <Badge variant="info">
                  {order.paymentMethod === 'cash' ? 'Tiền mặt' : 'Chuyển khoản'}
                </Badge>
              </div>

              {order.notes && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Ghi chú:
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {order.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>
        </div>
      </div>
      <Footer />
    </div>
  )
}
