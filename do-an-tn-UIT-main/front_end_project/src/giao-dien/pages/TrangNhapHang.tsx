/**
 * Purchases Page
 * Trang quản lý phiếu nhập hàng
 */

import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { NutBam } from '@/giao-dien/components/NutBam'
import { TheThongTin } from '@/giao-dien/components/TheThongTin'
import { BangDuLieu } from '@/giao-dien/components/BangDuLieu'
import { PhanTrang } from '@/giao-dien/components/PhanTrang'
import { HuyHieu } from '@/giao-dien/components/HuyHieu'
import { NhapLieu } from '@/giao-dien/components/NhapLieu'
import { Purchase } from '@/linh-vuc/purchases/entities/Purchase'
import { purchaseApi } from '@/ha-tang/api/purchaseApi'
import { formatCurrency, formatDateTime } from '@/ha-tang/utils/formatters'
import { Plus, Search, FileText, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/kho-trang-thai/khoXacThuc'

export const TrangNhapHang = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [filteredPurchases, setFilteredPurchases] = useState<Purchase[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
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
    // Reset về trang 1 khi tìm kiếm
    setCurrentPage(1)
  }, [searchQuery, purchases])

  // Tính toán dữ liệu phân trang
  const paginatedPurchases = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredPurchases.slice(startIndex, endIndex)
  }, [filteredPurchases, currentPage, itemsPerPage])

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

  const getStatusHuyHieu = (status: string) => {
    switch (status) {
      case 'completed':
        return <HuyHieu variant="success">Hoàn thành</HuyHieu>
      case 'cancelled':
        return <HuyHieu variant="danger">Đã hủy</HuyHieu>
      default:
        return <HuyHieu variant="warning">Đang xử lý</HuyHieu>
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
        <NutBam onClick={() => navigate('/purchases/new')}>
          <Plus size={20} className="mr-2" />
          Tạo phiếu nhập
        </NutBam>
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
            placeholder="Tìm kiếm phiếu nhập theo mã hoặc nhà cung cấp..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Purchases BangDuLieu */}
      <TheThongTin>
        {filteredPurchases.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Không tìm thấy phiếu nhập hàng nào
          </div>
        ) : (
          <>
            <BangDuLieu
              data={paginatedPurchases}
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
                accessor: (purchase: Purchase) => getStatusHuyHieu(purchase.status),
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
            {/* Pagination */}
            {filteredPurchases.length > 0 && (
              <PhanTrang
                currentPage={currentPage}
                totalItems={filteredPurchases.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
                itemsPerPageOptions={[10, 20, 50, 100]}
              />
            )}
          </>
        )}
      </TheThongTin>
    </div>
  )
}
