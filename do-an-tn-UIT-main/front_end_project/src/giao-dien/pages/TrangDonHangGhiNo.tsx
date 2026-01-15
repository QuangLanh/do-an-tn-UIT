/**
 * Debt Orders Page
 * Trang quản lý đơn hàng ghi nợ
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { NutBam } from '@/giao-dien/components/NutBam'
import { TheThongTin } from '@/giao-dien/components/TheThongTin'
import { BangDuLieu } from '@/giao-dien/components/BangDuLieu'
import { HuyHieu } from '@/giao-dien/components/HuyHieu'
import { NhapLieu } from '@/giao-dien/components/NhapLieu'
import { HopThoai } from '@/giao-dien/components/HopThoai'
import { Order, OrderItem } from '@/linh-vuc/orders/entities/Order'
import { Product } from '@/linh-vuc/products/entities/Product'
import { apiService } from '@/ha-tang/api'
import { formatCurrency, formatDateTime } from '@/ha-tang/utils/formatters'
import { Search, FileText, CheckCircle, CreditCard, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

/**
 * Map backend order response to frontend Order entity
 */
function mapBackendToFrontend(backendOrder: any): Order {
  const items: OrderItem[] = (backendOrder.items || []).map((item: any) => {
    const product: Product = item.product && typeof item.product === 'object'
      ? {
          id: item.product._id || item.product.id,
          name: item.product.name || item.productName,
          category: item.product.category || '',
          importPrice: item.product.purchasePrice || 0,
          salePrice: item.product.salePrice || item.price || 0,
          stock: item.product.stock || 0,
          unit: item.product.unit || '',
          supplier: '',
          description: item.product.description,
          createdAt: new Date(item.product.createdAt || Date.now()),
          updatedAt: new Date(item.product.updatedAt || Date.now()),
        }
      : {
          id: item.product || '',
          name: item.productName || '',
          category: '',
          importPrice: 0,
          salePrice: item.price || 0,
          stock: 0,
          unit: '',
          supplier: '',
          createdAt: new Date(),
          updatedAt: new Date(),
        }

    return {
      id: item._id || item.id || '',
      productId: typeof item.product === 'string' ? item.product : (item.product?._id || item.product?.id || ''),
      product,
      quantity: item.quantity,
      unitPrice: item.price || item.unitPrice || 0,
      subtotal: item.subtotal || item.quantity * (item.price || 0),
    }
  })

  return {
    id: backendOrder._id || backendOrder.id,
    orderNumber: backendOrder.orderNumber || '',
    items,
    totalAmount: backendOrder.subtotal || backendOrder.totalAmount || 0,
    discount: backendOrder.discount || 0,
    tax: backendOrder.tax || 0,
    finalAmount: backendOrder.total || backendOrder.finalAmount || 0,
    status: backendOrder.status || 'pending',
    paymentStatus: backendOrder.paymentStatus,
    paidAt: backendOrder.paidAt ? new Date(backendOrder.paidAt) : undefined,
    wasDebt: backendOrder.wasDebt || false,
    customerName: backendOrder.customerName,
    customerPhone: backendOrder.customerPhone,
    notes: backendOrder.notes,
    createdAt: new Date(backendOrder.createdAt || Date.now()),
    updatedAt: new Date(backendOrder.updatedAt || Date.now()),
    completedAt: backendOrder.completedAt ? new Date(backendOrder.completedAt) : undefined,
  }
}

export const TrangDonHangGhiNo = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<{ id: string; orderNumber: string } | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    loadDebtOrders()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      const filtered = orders.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (o.customerName && o.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (o.customerPhone && o.customerPhone.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      setFilteredOrders(filtered)
    } else {
      setFilteredOrders(orders)
    }
  }, [searchQuery, orders])

  const loadDebtOrders = async () => {
    try {
      setIsLoading(true)
      const data = await apiService.orders.debts()
      // Map dữ liệu từ backend về Order entity
      const mappedOrders = Array.isArray(data) 
        ? data.map(mapBackendToFrontend)
        : []
      // Sắp xếp theo thời gian tạo mới nhất
      const sortedData = [...mappedOrders].sort((a: Order, b: Order) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      setOrders(sortedData)
      setFilteredOrders(sortedData)
    } catch (error) {
      toast.error('Không thể tải danh sách đơn hàng ghi nợ')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePayDebt = (orderId: string, orderNumber: string) => {
    setSelectedOrder({ id: orderId, orderNumber })
    setIsModalOpen(true)
  }

  const confirmPayDebt = async () => {
    if (!selectedOrder) return

    try {
      await apiService.orders.payDebt(selectedOrder.id)
      toast.success('Đã ghi nhận thanh toán thành công')
      setIsModalOpen(false)
      setSelectedOrder(null)
      loadDebtOrders() // Reload danh sách
    } catch (error) {
      toast.error('Không thể ghi nhận thanh toán')
      console.error(error)
    }
  }

  const handleViewOrder = (order: Order) => {
    navigate(`/orders/${order.id}`)
  }

  const totalDebtAmount = orders.reduce((sum, order) => sum + (order.finalAmount || 0), 0)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">Đang tải...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <CreditCard className="mr-3" size={32} />
            Quản lý đơn hàng ghi nợ
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Tổng số: {orders.length} đơn hàng | Tổng tiền nợ: <span className="font-bold text-orange-600 dark:text-orange-400">{formatCurrency(totalDebtAmount)}</span>
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search
            size={20}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <NhapLieu
            type="text"
            placeholder="Tìm kiếm đơn hàng theo mã, tên khách hàng hoặc số điện thoại..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Orders BangDuLieu */}
      <TheThongTin>
        {filteredOrders.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {searchQuery ? 'Không tìm thấy đơn hàng nào' : 'Không có đơn hàng ghi nợ nào'}
          </div>
        ) : (
          <BangDuLieu
            data={filteredOrders}
            columns={[
              {
                header: 'Mã đơn hàng',
                accessor: 'orderNumber' as keyof Order,
              },
              {
                header: 'Khách hàng',
                accessor: (order: Order) => (
                  <div>
                    <div className="font-medium">{order.customerName || 'Không có tên'}</div>
                    {order.customerPhone && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {order.customerPhone}
                      </div>
                    )}
                  </div>
                ),
              },
              {
                header: 'Tổng tiền',
                accessor: (order: Order) => (
                  <span className="font-bold text-orange-600 dark:text-orange-400">
                    {formatCurrency(order.finalAmount)}
                  </span>
                ),
              },
              {
                header: 'Ngày mua',
                accessor: (order: Order) => formatDateTime(new Date(order.createdAt)),
              },
              {
                header: 'Trạng thái',
                accessor: () => <HuyHieu variant="warning">Chưa thanh toán</HuyHieu>,
              },
              {
                header: 'Thao tác',
                accessor: (order: Order) => (
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handlePayDebt(order.id, order.orderNumber)
                      }}
                      className="flex items-center space-x-1 px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                      title="Đã trả nợ"
                    >
                      <CheckCircle size={14} />
                      <span>Đã trả nợ</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleViewOrder(order)
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded"
                      title="Xem chi tiết"
                    >
                      <FileText size={16} />
                    </button>
                  </div>
                ),
              },
            ]}
            onRowClick={handleViewOrder}
          />
        )}
      </TheThongTin>

      {/* Modal xác nhận thanh toán nợ */}
      <HopThoai
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedOrder(null)
        }}
        title="Xác nhận thanh toán nợ"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="text-orange-500 mt-0.5" size={24} />
            <div className="flex-1">
              <p className="text-gray-700 dark:text-gray-300">
                Bạn có chắc chắn muốn xác nhận khách hàng đã thanh toán đơn hàng{' '}
                <strong className="text-gray-900 dark:text-white">{selectedOrder?.orderNumber}</strong>?
              </p>
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <NutBam
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false)
                setSelectedOrder(null)
              }}
            >
              Hủy
            </NutBam>
            <NutBam onClick={confirmPayDebt}>
              Đồng ý
            </NutBam>
          </div>
        </div>
      </HopThoai>
    </div>
  )
}
