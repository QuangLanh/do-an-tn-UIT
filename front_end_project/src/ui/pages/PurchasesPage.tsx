/**
 * Purchases Page
 * Trang quản lý phiếu nhập hàng
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/ui/components/Button'
import { Card } from '@/ui/components/Card'
import { Table } from '@/ui/components/Table'
import { Badge } from '@/ui/components/Badge'
import { Input } from '@/ui/components/Input'
import { Purchase } from '@/domains/purchases/entities/Purchase'
import { purchaseApi } from '@/infra/api/purchaseApi'
import { formatCurrency, formatDateTime } from '@/infra/utils/formatters'
import { Plus, Search, FileText, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'

export const PurchasesPage = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [filteredPurchases, setFilteredPurchases] = useState<Purchase[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()
  const { hasPermission } = useAuthStore()

  useEffect(() => {
    loadPurchases()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      const filtered = purchases.filter(
        (p) =>
          p.purchaseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.supplierName.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredPurchases(filtered)
    } else {
      setFilteredPurchases(purchases)
    }
  }, [searchQuery, purchases])

  const loadPurchases = async () => {
    try {
      setIsLoading(true)
      const data = await purchaseApi.getAllPurchases.execute()
      // Sắp xếp theo thời gian tạo mới nhất
      const sortedData = [...data].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      setPurchases(sortedData)
      setFilteredPurchases(sortedData)
    } catch (error) {
      toast.error('Không thể tải danh sách phiếu nhập hàng')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!hasPermission('delete_product')) {
      toast.error('Bạn không có quyền xóa phiếu nhập hàng')
      return
    }

    if (!confirm('Bạn có chắc chắn muốn xóa phiếu nhập hàng này?')) return

    try {
      await purchaseApi.service.deletePurchase(id)
      toast.success('Đã xóa phiếu nhập hàng thành công')
      loadPurchases()
    } catch (error) {
      toast.error('Không thể xóa phiếu nhập hàng')
    }
  }

  const handleViewPurchase = (purchase: Purchase) => {
    navigate(`/purchases/${purchase.id}`)
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quản lý nhập hàng</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Tổng số: {purchases.length} phiếu nhập hàng
          </p>
        </div>
        <Button onClick={() => navigate('/purchases/new')}>
          <Plus size={20} className="mr-2" />
          Tạo phiếu nhập
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
            placeholder="Tìm kiếm phiếu nhập theo mã hoặc nhà cung cấp..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Purchases Table */}
      <Card>
        {filteredPurchases.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Không tìm thấy phiếu nhập hàng nào
          </div>
        ) : (
          <Table
            data={filteredPurchases}
            columns={[
              {
                header: 'Mã phiếu nhập',
                accessor: 'purchaseNumber' as keyof Purchase,
              },
              {
                header: 'Nhà cung cấp',
                accessor: 'supplierName' as keyof Purchase,
              },
              {
                header: 'Tổng tiền',
                accessor: (purchase: Purchase) => formatCurrency(purchase.totalAmount),
              },
              {
                header: 'Số sản phẩm',
                accessor: (purchase: Purchase) => purchase.items.length,
              },
              {
                header: 'Trạng thái',
                accessor: (purchase: Purchase) => getStatusBadge(purchase.status),
              },
              {
                header: 'Ngày tạo',
                accessor: (purchase: Purchase) => formatDateTime(new Date(purchase.createdAt)),
              },
              {
                header: 'Thao tác',
                accessor: (purchase: Purchase) => (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewPurchase(purchase)}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded"
                      title="Xem chi tiết"
                    >
                      <FileText size={16} />
                    </button>
                    {hasPermission('delete_product') && (
                      <button
                        onClick={() => handleDelete(purchase.id)}
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
            onRowClick={handleViewPurchase}
          />
        )}
      </Card>
    </div>
  )
}
