/**
 * Orders Page
 * Trang quản lý đơn hàng
 */

import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { NutBam } from '@/giao-dien/components/NutBam'
import { TheThongTin } from '@/giao-dien/components/TheThongTin'
import { BangDuLieu } from '@/giao-dien/components/BangDuLieu'
import { PhanTrang } from '@/giao-dien/components/PhanTrang'
import { HuyHieu } from '@/giao-dien/components/HuyHieu'
import { NhapLieu } from '@/giao-dien/components/NhapLieu'
import { Order } from '@/linh-vuc/orders/entities/Order'
import { orderApi } from '@/ha-tang/api/orderApi'
import { apiService } from '@/ha-tang/api'
import { formatCurrency, formatDateTime } from '@/ha-tang/utils/formatters'
import { Plus, Search, FileText, Trash2, RefreshCcw } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/kho-trang-thai/khoXacThuc'
// Import Component Trả hàng mới
import { HopThoaiTraHang } from '@/giao-dien/components/HopThoaiTraHang'

export const TrangDonHang = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // State cho trả hàng
  const [returningOrder, setReturningOrder] = useState<Order | null>(null)
  // Mã đơn đã có đổi/trả (từ API exchanges + returns) để disable nút đổi/trả ngay cả khi hasAfterSale chưa sync
  const [processedOrderNumbers, setProcessedOrderNumbers] = useState<Set<string>>(new Set())

  const navigate = useNavigate()
  const { hasPermission } = useAuthStore()

  useEffect(() => {
    loadOrders()
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

  const loadOrders = async () => {
    try {
      setIsLoading(true)
      const [data, exchangesRes, returnsRes] = await Promise.all([
        orderApi.getAllOrders.execute(),
        apiService.orders.exchanges().catch(() => []),
        apiService.orders.returns().catch(() => []),
      ])
      const exchanges = Array.isArray(exchangesRes) ? exchangesRes : []
      const returns = Array.isArray(returnsRes) ? returnsRes : []
      const processed = new Set<string>()
      exchanges.forEach((o: any) => { if (o.relatedOrderCode) processed.add(o.relatedOrderCode) })
      returns.forEach((o: any) => { if (o.relatedOrderCode) processed.add(o.relatedOrderCode) })
      setProcessedOrderNumbers(processed)

      // Fix dữ liệu ngay trong frontend: nếu status = completed thì payment status phải là PAID
      const fixedData = data.map(order => {
        if (order.status === 'completed' && order.paymentStatus !== 'PAID' && order.paymentStatus !== 'REFUNDED') {
          // Fix ngay trong frontend để UI hiển thị đúng
          return {
            ...order,
            paymentStatus: 'PAID' as const,
            paidAt: order.paidAt || new Date(),
          }
        }
        return order
      })
      
      // Tự động sync payment status ở backend (chạy background)
      const syncPromises = data
        .filter(order => order.status === 'completed' && order.paymentStatus !== 'PAID' && order.paymentStatus !== 'REFUNDED')
        .map(order => 
          orderApi.service.updatePaymentStatus(order.id, 'PAID').catch(err => {
            console.error(`Failed to sync payment status for order ${order.orderNumber}:`, err)
          })
        )
      
      // Chạy sync ở background
      Promise.all(syncPromises).catch(() => {})
      
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

  const handleDelete = async (id: string) => {
    if (!hasPermission('delete_product')) {
      toast.error('Bạn không có quyền xóa đơn hàng')
      return
    }
    if (!confirm('Bạn có chắc chắn muốn xóa đơn hàng này?')) return

    try {
      await orderApi.service.deleteOrder(id)
      toast.success('Đã xóa đơn hàng thành công')
      loadOrders()
    } catch (error) {
      toast.error('Không thể xóa đơn hàng')
    }
  }

  // Hàm xử lý gửi yêu cầu trả hàng (dùng chung apiService như trang Đổi/Trả hàng)
  const handleReturnSubmit = async (data: any) => {
    const payload = {
      originalOrderCode: data.originalOrderCode,
      returnItems: data.returnItems.map((item: any) => ({
        productId: String(item.productId),
        quantity: Number(item.quantity),
      })),
      returnReason: data.returnReason || 'Khách yêu cầu trả hàng',
      isRestocked: data.isRestocked !== false,
      notes: data.notes,
    }

    try {
      await apiService.orders.return(payload)
      toast.success('Đã tạo đơn trả hàng thành công')
      setReturningOrder(null)
      loadOrders()
    } catch (error: any) {
      const msg = error?.response?.data?.message ?? error?.message
      toast.error(Array.isArray(msg) ? msg[0] : msg || 'Có lỗi xảy ra')
    }
  }

  const handleViewOrder = (order: Order) => {
    navigate(`/orders/${order.id}`)
  }

  const normalizeStatusForAfterSale = (status: string): Order['status'] => {
    const s = (status || '').toLowerCase()
    if (['cho_xac_nhan', 'confirmed', 'processing'].includes(s)) return 'pending'
    if (['dang_van_chuyen'].includes(s)) return 'shipping'
    if (['hoan_thanh', 'delivered'].includes(s)) return 'completed'
    if (['da_huy'].includes(s)) return 'cancelled'
    return s as Order['status']
  }

  const getAfterSaleEligibility = (order: Order): { eligible: boolean; reason?: string } => {
    if (!order.orderNumber?.startsWith('ORD') || order.orderType !== 'SALE') {
      return { eligible: false, reason: 'Chỉ áp dụng cho đơn bán gốc (mã ORD)' }
    }
    const currentStatus = normalizeStatusForAfterSale(order.status)
    if (currentStatus !== 'completed') {
      return { eligible: false, reason: 'Đơn chưa hoàn thành' }
    }
    if (order.paymentStatus !== 'PAID' || order.wasDebt === true) {
      return { eligible: false, reason: 'Đơn chưa thanh toán đủ hoặc mua thiếu' }
    }
    if (order.hasAfterSale === true) {
      return { eligible: false, reason: 'Đơn đã phát sinh đổi/trả trước đó' }
    }
    if (processedOrderNumbers.has(order.orderNumber)) {
      return { eligible: false, reason: 'Đơn đã phát sinh đổi/trả trước đó' }
    }
    return { eligible: true }
  }

  const getStatusHuyHieu = (status: string) => {
    switch (status) {
      case 'pending':
      case 'confirmed':
        return <HuyHieu variant="warning">Chờ xử lý</HuyHieu>
      case 'shipping':
        return <HuyHieu variant="info">Đang vận chuyển</HuyHieu>
      case 'completed':
        return <HuyHieu variant="success">Hoàn thành</HuyHieu>
      case 'cancelled':
        return <HuyHieu variant="danger">Đã hủy</HuyHieu>
      default:
        return <HuyHieu variant="default">{status}</HuyHieu>
    }
  }

  const getPaymentStatusHuyHieu = (order: Order) => {
    // Đảm bảo: nếu status = completed thì payment status phải là PAID
    let paymentStatus = order.paymentStatus
    if (order.status === 'completed' && paymentStatus !== 'PAID' && paymentStatus !== 'REFUNDED') {
      paymentStatus = 'PAID'
    }
    
    if (paymentStatus === 'DEBT') {
      return <HuyHieu variant="danger">Chưa thanh toán</HuyHieu>
    }
    // Trạng thái đã hoàn tiền
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quản lý đơn hàng</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Tổng số: {orders.length} đơn hàng
          </p>
        </div>
        <NutBam onClick={() => navigate('/orders/new')}>
          <Plus size={20} className="mr-2" />
          Tạo đơn hàng
        </NutBam>
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
                  accessor: (order: Order) => getStatusHuyHieu(order.status),
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
                {
                  header: 'Thao tác',
                  accessor: (order: Order) => (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewOrder(order)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded"
                        title="Xem chi tiết"
                      >
                        <FileText size={16} />
                      </button>

                      {/* NÚT TRẢ HÀNG */}
                      {(() => {
                        const { eligible, reason } = getAfterSaleEligibility(order)
                        return (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              if (!eligible) {
                                toast.error(reason || 'Đơn hàng không đủ điều kiện đổi/trả')
                                return
                              }
                              setReturningOrder(order)
                            }}
                            className={`p-2 rounded ${
                              eligible
                                ? 'text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900'
                                : 'text-gray-400 cursor-not-allowed'
                            }`}
                            title={eligible ? 'Trả hàng' : reason}
                            disabled={!eligible}
                          >
                            <RefreshCcw size={16} />
                          </button>
                        )
                      })()}

                      {hasPermission('delete_product') && (
                        <button
                          onClick={() => handleDelete(order.id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded"
                          title="Xóa"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ),
                  className: 'whitespace-nowrap',
                },
              ]}
              onRowClick={handleViewOrder}
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

      {/* RENDER MODAL TRẢ HÀNG */}
      <HopThoaiTraHang
        isOpen={!!returningOrder}
        onClose={() => setReturningOrder(null)}
        order={returningOrder}
        onSubmit={handleReturnSubmit}
      />
    </div>
  )
}