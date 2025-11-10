/**
 * Orders Page
 * Trang quản lý đơn hàng
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/ui/components/Button'
import { Card } from '@/ui/components/Card'
import { Table } from '@/ui/components/Table'
import { Badge } from '@/ui/components/Badge'
import { Input } from '@/ui/components/Input'
import { Order } from '@/domains/orders/entities/Order'
import { orderApi } from '@/infra/api/orderApi'
import { formatCurrency, formatDateTime } from '@/infra/utils/formatters'
import { Plus, Search, FileText, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'

export const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
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
  }, [searchQuery, orders])

  const loadOrders = async () => {
    try {
      setIsLoading(true)
      const data = await orderApi.getAllOrders.execute()
      // Sắp xếp theo thời gian tạo mới nhất
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

  const handleViewOrder = (order: Order) => {
    navigate(`/orders/${order.id}`)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success">Hoàn thành</Badge>
      case 'cancelled':
        return <Badge variant="danger">Đã hủy</Badge>
      default:
        return <Badge variant="warning">Đang xử lý</Badge>
    }
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quản lý đơn hàng</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Tổng số: {orders.length} đơn hàng
          </p>
        </div>
        <Button onClick={() => navigate('/orders/new')}>
          <Plus size={20} className="mr-2" />
          Tạo đơn hàng
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search
            size={20}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <Input
            type="text"
            placeholder="Tìm kiếm đơn hàng theo mã, tên khách hàng hoặc số điện thoại..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Orders Table */}
      <Card>
        {filteredOrders.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Không tìm thấy đơn hàng nào
          </div>
        ) : (
          <Table
            data={filteredOrders}
            columns={[
              {
                header: 'Mã đơn hàng',
                accessor: 'orderNumber' as keyof Order,
              },
              {
                header: 'Khách hàng',
                accessor: (order: Order) => order.customerName || 'Khách lẻ',
              },
              {
                header: 'Tổng tiền',
                accessor: (order: Order) => formatCurrency(order.finalAmount),
              },
              {
                header: 'Số sản phẩm',
                accessor: (order: Order) => order.items.length,
              },
              {
                header: 'Trạng thái',
                accessor: (order: Order) => getStatusBadge(order.status),
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
        )}
      </Card>
    </div>
  )
}
