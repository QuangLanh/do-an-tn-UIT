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
      const data = await orderApi.getAllOrders.execute()
      const sortedData = [...data].sort((a, b) => 
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

  // Hàm xử lý gửi yêu cầu trả hàng
  const handleReturnSubmit = async (data: any) => {
    // 1. CHUẨN BỊ PAYLOAD
    const payload = {
        originalOrderCode: data.originalOrderCode,
        returnItems: data.returnItems.map((item: any) => ({
            productId: item.productId,
            quantity: Number(item.quantity)
        })),
        returnReason: data.returnReason,
        isRestocked: Boolean(data.isRestocked),
        notes: data.notes
    };

    // --- DEBUG LOG (Gửi cái này cho tôi) ---
    console.log("=== FRONTEND SENDING DATA ===");
    console.log(JSON.stringify(payload, null, 2));
    // ---------------------------------------

    try {
        const token = localStorage.getItem('token'); 
        const response = await fetch(`${import.meta.env.VITE_API_URL}/orders/return`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(payload)
        });
        
        if(!response.ok) {
            const err = await response.json();
            // --- DEBUG LOG LỖI (Gửi cái này cho tôi) ---
            console.error("=== BACKEND ERROR RESPONSE ===");
            console.error(err);
            // ------------------------------------------
            const message = Array.isArray(err.message) ? err.message[0] : err.message;
            throw new Error(message || 'Lỗi khi trả hàng');
        }
        
        toast.success('Đã tạo đơn trả hàng thành công');
        setReturningOrder(null);
        loadOrders();
    } catch (error: any) {
        toast.error(error.message || 'Có lỗi xảy ra');
    }
  }

  const handleViewOrder = (order: Order) => {
    navigate(`/orders/${order.id}`)
  }

  const getPaymentStatusHuyHieu = (order: Order) => {
    if (order.paymentStatus === 'DEBT') {
      return <HuyHieu variant="danger">Chưa thanh toán</HuyHieu>
    }
    // Trạng thái đã hoàn tiền
    if (order.paymentStatus === 'REFUNDED') {
        return <HuyHieu variant="info">Đã hoàn tiền</HuyHieu>
    }
    if (order.paymentStatus === 'PAID' && order.wasDebt === true) {
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
      <div className="flex justify-between items-center">
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

      <TheThongTin>
        {filteredOrders.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
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
                },
                {
                  header: 'Loại',
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
                },
                {
                  header: 'Trạng thái TT',
                  accessor: (order: Order) => getPaymentStatusHuyHieu(order),
                },
                {
                  header: 'Ngày tạo',
                  accessor: (order: Order) => formatDateTime(new Date(order.createdAt)),
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

                      {/* NÚT TRẢ HÀNG MỚI THÊM VÀO */}
                      {order.orderType === 'SALE' && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setReturningOrder(order);
                            }}
                            className="p-2 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900 rounded"
                            title="Trả hàng / Hoàn tiền"
                        >
                            <RefreshCcw size={16} />
                        </button>
                      )}

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
                },
              ]}
              onRowClick={handleViewOrder}
            />
            {filteredOrders.length > 0 && (
              <PhanTrang
                currentPage={currentPage}
                totalItems={filteredOrders.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
                itemsPerPageOptions={[10, 20, 50, 100]}
              />
            )}
          </>
        )}
      </TheThongTin>

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