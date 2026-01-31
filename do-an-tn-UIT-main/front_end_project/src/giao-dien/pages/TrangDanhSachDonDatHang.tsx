/**
 * Order Status Management Page
 * Trang quản lý trạng thái đơn hàng
 */

import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { TheThongTin } from '@/giao-dien/components/TheThongTin'
import { BangDuLieu } from '@/giao-dien/components/BangDuLieu'
import { PhanTrang } from '@/giao-dien/components/PhanTrang'
import { HuyHieu } from '@/giao-dien/components/HuyHieu'
import { NhapLieu } from '@/giao-dien/components/NhapLieu'
import { HopThoai } from '@/giao-dien/components/HopThoai'
import { NutBam } from '@/giao-dien/components/NutBam'
import { Order } from '@/linh-vuc/orders/entities/Order'
import { orderApi } from '@/ha-tang/api/orderApi'
import { formatCurrency, formatDateTime } from '@/ha-tang/utils/formatters'
import { useSidebarStore } from '@/kho-trang-thai/khoThanhBen'
import { Search } from 'lucide-react'
import toast from 'react-hot-toast'

export const TrangDanhSachDonDatHang = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; orderId: string; orderNumber: string }>({
    isOpen: false,
    orderId: '',
    orderNumber: '',
  })

  const navigate = useNavigate()

  useEffect(() => {
    loadOrders()
    // Cập nhật badge "đơn chờ xử lý" ngay khi vào trang
    useSidebarStore.getState().refreshPendingOrdersCount()
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
    setCurrentPage(1)
  }, [searchQuery, orders])

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredOrders.slice(startIndex, endIndex)
  }, [filteredOrders, currentPage, itemsPerPage])

  const loadOrders = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true)
      // Chỉ lấy đơn hàng online (isOnline = true)
      const data = await orderApi.getAllOrders.execute({ isOnline: true })
      
      // Fix dữ liệu: completed + paymentStatus lỗi/legacy → PAID (KHÔNG áp dụng cho đơn ghi nợ DEBT)
      const fixedData = data.map(order => {
        const needsFix = order.status === 'completed' &&
          order.paymentStatus !== 'PAID' &&
          order.paymentStatus !== 'REFUNDED' &&
          order.paymentStatus !== 'DEBT' // Đơn ghi nợ giữ nguyên
        if (needsFix) {
          return {
            ...order,
            paymentStatus: 'PAID' as const,
            paidAt: order.paidAt || new Date(),
          }
        }
        return order
      })
      
      const sortedData = [...fixedData].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      setOrders(sortedData)
      setFilteredOrders(sortedData)
    } catch (error) {
      toast.error('Không thể tải danh sách đơn hàng')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColors = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700'
      case 'shipping':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border-blue-300 dark:border-blue-700'
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-300 dark:border-green-700'
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 border-red-300 dark:border-red-700'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
    }
  }

  /** Chuẩn hóa trạng thái (legacy) về 1 trong 4 để áp dụng rule */
  const normalizeStatusForRule = (status: string): Order['status'] => {
    const s = (status || '').toLowerCase()
    if (['cho_xac_nhan', 'confirmed', 'processing'].includes(s)) return 'pending'
    if (['dang_van_chuyen'].includes(s)) return 'shipping'
    if (['hoan_thanh', 'delivered'].includes(s)) return 'completed'
    if (['da_huy'].includes(s)) return 'cancelled'
    return s as Order['status']
  }

  /** Trạng thái được phép chuyển tiếp từ trạng thái hiện tại (nghiệp vụ bán hàng) */
  const getValidNextStatuses = (current: Order['status']): Order['status'][] => {
    const map: Record<Order['status'], Order['status'][]> = {
      pending: ['shipping', 'cancelled'],
      shipping: ['completed', 'cancelled'],
      completed: [],
      cancelled: [],
    }
    return map[current] ?? []
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Chờ xử lý',
      shipping: 'Đang vận chuyển',
      completed: 'Hoàn thành',
      cancelled: 'Đã hủy',
    }
    return labels[status] ?? status
  }

  const handleUpdateStatus = async (orderId: string, newStatus: string, orderNumber: string) => {
    // Nếu set thành "completed", hiển thị modal confirm
    if (newStatus === 'completed') {
      setConfirmModal({
        isOpen: true,
        orderId,
        orderNumber,
      })
      return
    }

    // Các trạng thái khác: tự động set payment status thành DEBT
    await handleStatusUpdateWithPayment(orderId, newStatus, 'DEBT')
  }

  const handleConfirmComplete = async () => {
    const { orderId } = confirmModal
    // Set status thành completed và payment status thành PAID
    await handleStatusUpdateWithPayment(orderId, 'completed', 'PAID')
    setConfirmModal({ isOpen: false, orderId: '', orderNumber: '' })
  }

  const handleStatusUpdateWithPayment = async (orderId: string, newStatus: string, newPaymentStatus: string) => {
    try {
      // Update status trước – dùng kết quả trả về để cập nhật UI ngay (tránh UI vẫn hiển thị trạng thái cũ)
      const updatedOrder = await orderApi.service.updateOrderStatus(orderId, newStatus)
      await orderApi.service.updatePaymentStatus(orderId, newPaymentStatus)

      // Cập nhật UI từ response để đảm bảo hiển thị đúng trạng thái mới (shipping, completed, v.v.)
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                status: (updatedOrder?.status ?? newStatus) as Order['status'],
                paymentStatus: newPaymentStatus as Order['paymentStatus'],
                ...(newPaymentStatus === 'PAID' ? { paidAt: o.paidAt || new Date() } : {}),
              }
            : o
        )
      )

      toast.success('Đã cập nhật trạng thái đơn hàng')
      // Refresh danh sách im lặng và badge đơn chờ xử lý
      loadOrders(true)
      useSidebarStore.getState().refreshPendingOrdersCount()
    } catch (error: any) {
      const msg = error?.response?.data?.message ?? error?.message ?? 'Không thể cập nhật trạng thái'
      toast.error(Array.isArray(msg) ? msg[0] : msg)
      console.error(error)
    }
  }

  const getPaymentStatusHuyHieu = (order: Order) => {
    // Đảm bảo: nếu status = completed thì payment status phải là PAID
    let paymentStatus = order.paymentStatus
    // Chỉ ép PAID cho completed nếu không phải DEBT (đơn ghi nợ giữ nguyên)
    if (order.status === 'completed' && paymentStatus !== 'PAID' && paymentStatus !== 'REFUNDED' && paymentStatus !== 'DEBT') {
      paymentStatus = 'PAID'
    }
    
    if (paymentStatus === 'DEBT') {
      return <HuyHieu variant="danger">Chưa thanh toán</HuyHieu>
    }
    if (paymentStatus === 'REFUNDED') {
      return <HuyHieu variant="info">Đã hoàn tiền</HuyHieu>
    }
    if (paymentStatus === 'PAID' && order.wasDebt === true) {
      return <HuyHieu variant="orange">Đã thanh toán (từ ghi nợ)</HuyHieu>
    }
    return <HuyHieu variant="success">Đã thanh toán</HuyHieu>
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">Đang tải...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center px-6 py-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Danh sách đơn đặt hàng</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Tổng số: {orders.length} đơn hàng
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-4 px-6">
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

      <TheThongTin className="no-padding">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400 px-6">
            Không tìm thấy đơn hàng nào
          </div>
        ) : (
          <>
            <BangDuLieu
              data={paginatedOrders}
              columns={[
                {
                  header: 'Mã đơn hàng',
                  accessor: 'orderNumber' as keyof Order,
                  className: 'whitespace-nowrap',
                },
                {
                  header: 'Khách hàng',
                  accessor: (order: Order) => (
                    <span>
                      {order.orderType === 'RETURN' && <span className="text-red-500 font-bold mr-1">[TRẢ]</span>}
                      {order.customerName || 'Khách lẻ'}
                    </span>
                  ),
                },
                {
                  header: 'Tổng tiền',
                  accessor: (order: Order) => (
                    <span className={order.finalAmount < 0 ? 'text-red-600 font-bold' : ''}>
                      {formatCurrency(order.finalAmount)}
                    </span>
                  ),
                  className: 'whitespace-nowrap',
                },
                {
                  header: 'Số sản phẩm',
                  accessor: (order: Order) => order.items.length,
                  className: 'whitespace-nowrap text-center',
                },
                {
                  header: 'Trạng thái đơn hàng',
                  accessor: (order: Order) => {
                    const current = normalizeStatusForRule(order.status)
                    const validNext = getValidNextStatuses(current)
                    const isTerminal = current === 'completed' || current === 'cancelled'
                    const statusOptions: { value: Order['status']; label: string }[] = [
                      { value: 'pending', label: 'Chờ xử lý' },
                      { value: 'shipping', label: 'Đang vận chuyển' },
                      { value: 'completed', label: 'Hoàn thành' },
                      { value: 'cancelled', label: 'Đã hủy' },
                    ]
                    if (isTerminal) {
                      return (
                        <span
                          className={`inline-block text-xs border rounded-full px-3 py-1 font-medium ${getStatusColors(order.status)}`}
                        >
                          {getStatusLabel(order.status)}
                        </span>
                      )
                    }
                    return (
                      <select
                        value={order.status}
                        onChange={(e) => {
                          e.stopPropagation()
                          handleUpdateStatus(order.id, e.target.value, order.orderNumber)
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className={`text-xs border rounded-full px-3 py-1 font-medium ${getStatusColors(order.status)}`}
                      >
                        {statusOptions.map((opt) => (
                          <option
                            key={opt.value}
                            value={opt.value}
                            disabled={!validNext.includes(opt.value)}
                          >
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    )
                  },
                },
                {
                  header: 'Thanh toán',
                  accessor: (order: Order) => getPaymentStatusHuyHieu(order),
                },
                {
                  header: 'Ngày tạo',
                  accessor: (order: Order) => formatDateTime(new Date(order.createdAt)),
                  className: 'whitespace-nowrap',
                },
              ]}
              onRowClick={(order) => navigate(`/orders/${order.id}`)}
            />
          </>
        )}
      </TheThongTin>

      {/* Pagination - Separate section below table */}
      {filteredOrders.length > 0 && (
        <div className="px-6">
          <PhanTrang
            currentPage={currentPage}
            totalItems={filteredOrders.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
            itemsPerPageOptions={[10, 20, 50, 100]}
          />
        </div>
      )}

      {/* Confirm Modal for Completing Order */}
      <HopThoai
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, orderId: '', orderNumber: '' })}
        title="Xác nhận hoàn thành đơn hàng"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Bạn có chắc chắn muốn đánh dấu đơn hàng <span className="font-bold">{confirmModal.orderNumber}</span> là <span className="font-bold text-green-600">Hoàn thành</span>?
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Khi đánh dấu hoàn thành, trạng thái thanh toán sẽ tự động được cập nhật thành <span className="font-medium">Đã thanh toán</span>.
          </p>
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <NutBam
              type="button"
              variant="secondary"
              onClick={() => setConfirmModal({ isOpen: false, orderId: '', orderNumber: '' })}
            >
              Hủy
            </NutBam>
            <NutBam
              type="button"
              variant="success"
              onClick={handleConfirmComplete}
            >
              Xác nhận
            </NutBam>
          </div>
        </div>
      </HopThoai>
    </div>
  )
}
