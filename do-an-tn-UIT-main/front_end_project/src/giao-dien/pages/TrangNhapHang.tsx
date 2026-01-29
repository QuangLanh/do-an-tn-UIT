/**
 * TRANG QUẢN LÝ NHẬP HÀNG (TrangNhapHang.tsx)
 * - Đã fix lỗi hiển thị Tên Nhà Cung Cấp (thay vì ID hoặc trống)
 */

import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { NutBam } from '@/giao-dien/components/NutBam'
import { TheThongTin } from '@/giao-dien/components/TheThongTin'
import { BangDuLieu } from '@/giao-dien/components/BangDuLieu'
import { PhanTrang } from '@/giao-dien/components/PhanTrang'
import { HuyHieu } from '@/giao-dien/components/HuyHieu'
import { NhapLieu } from '@/giao-dien/components/NhapLieu'
// API
import { purchaseApi } from '@/ha-tang/api/purchaseApi'
import { supplierApi } from '@/ha-tang/api/supplierApi' // 👈 Import thêm cái này
import { formatCurrency, formatDateTime } from '@/ha-tang/utils/formatters'
import { Plus, Search, FileText, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/kho-trang-thai/khoXacThuc'

export const TrangNhapHang = () => {
  const [purchases, setPurchases] = useState<any[]>([]) // Dùng any cho linh hoạt
  const [suppliers, setSuppliers] = useState<any[]>([]) // 👈 State lưu danh sách NCC
  const [filteredPurchases, setFilteredPurchases] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  
  const navigate = useNavigate()
  const { hasPermission } = useAuthStore()

  // 1. Load dữ liệu (Cả phiếu nhập và NCC)
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      // Gọi song song 2 API
      const [purchasesData, suppliersData] = await Promise.all([
        purchaseApi.getAllPurchases.execute(),
        supplierApi.getAll.execute()
      ])

      // Sắp xếp mới nhất lên đầu
      const sortedData = [...purchasesData].sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      
      setPurchases(sortedData)
      setFilteredPurchases(sortedData)
      setSuppliers(suppliersData) // Lưu NCC để tra cứu
      
    } catch (error) {
      toast.error('Không thể tải dữ liệu')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  // 2. Hàm tra cứu tên NCC từ ID (Logic quan trọng nhất)
  const getSupplierName = (supplierInfo: any) => {
      // Nếu backend trả về object có tên sẵn
      if (typeof supplierInfo === 'object' && supplierInfo?.name) {
          return supplierInfo.name;
      }
      // Nếu backend trả về ID -> Tìm trong list suppliers
      const sId = typeof supplierInfo === 'object' ? (supplierInfo._id || supplierInfo.id) : supplierInfo;
      const found = suppliers.find(s => s.id === sId || (s as any)._id === sId);
      
      return found ? found.name : "---";
  }

  // 3. Filter tìm kiếm
  useEffect(() => {
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      const filtered = purchases.filter((p) => {
          // Tìm theo mã phiếu
          const codeMatch = (p.code || p.purchaseNumber || p.id)?.toLowerCase().includes(lowerQuery);
          // Tìm theo tên NCC (dùng hàm getSupplierName để tìm chính xác)
          const supName = getSupplierName(p.supplier).toLowerCase();
          const supplierMatch = supName.includes(lowerQuery);
          
          return codeMatch || supplierMatch;
      })
      setFilteredPurchases(filtered)
    } else {
      setFilteredPurchases(purchases)
    }
    setCurrentPage(1)
  }, [searchQuery, purchases, suppliers]) // Thêm suppliers vào dependency

  const paginatedPurchases = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredPurchases.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredPurchases, currentPage, itemsPerPage])

  const handleDelete = async (id: string) => {
    if (!hasPermission('delete_product')) {
      toast.error('Bạn không có quyền xóa')
      return
    }
    if (!confirm('Bạn có chắc chắn muốn xóa?')) return

    try {
      await purchaseApi.service.deletePurchase(id)
      toast.success('Đã xóa thành công')
      loadData()
    } catch (error) {
      toast.error('Không thể xóa')
    }
  }

  const getStatusHuyHieu = (status: string) => {
    switch (status) {
      case 'completed': return <HuyHieu variant="success">Hoàn thành</HuyHieu>
      case 'cancelled': return <HuyHieu variant="danger">Đã hủy</HuyHieu>
      default: return <HuyHieu variant="warning">Đang xử lý</HuyHieu>
    }
  }

  if (isLoading) return <div className="p-8 text-center">Đang tải dữ liệu...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quản lý nhập hàng</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Tổng số: {purchases.length} phiếu</p>
        </div>
        <NutBam onClick={() => navigate('/purchases/new')}>
          <Plus size={20} className="mr-2" /> Tạo phiếu nhập
        </NutBam>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <NhapLieu
            type="text"
            placeholder="Tìm kiếm theo mã phiếu hoặc tên NCC..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <TheThongTin>
        <BangDuLieu
          data={paginatedPurchases}
          columns={[
            {
              header: 'Mã phiếu',
              // Ưu tiên hiển thị code, nếu không có thì hiển thị purchaseNumber, ko có nữa thì cắt ID
              accessor: (p: any) => <span className="font-mono text-gray-600">#{p.code || p.purchaseNumber || p.id?.slice(-6)}</span>,
            },
            {
              header: 'Nhà cung cấp',
              // 👇 SỬ DỤNG HÀM TRA CỨU ĐỂ HIỂN THỊ TÊN
              accessor: (p: any) => <span className="font-medium text-blue-600">{getSupplierName(p.supplier)}</span>,
            },
            {
              header: 'Tổng tiền',
              // Tự tính tổng tiền nếu backend chưa trả về totalAmount
              accessor: (p: any) => {
                  const total = p.totalAmount || p.items?.reduce((sum: number, i: any) => sum + (i.quantity * (i.purchasePrice || i.importPrice || 0)), 0) || 0;
                  return <span className="font-bold text-emerald-600">{formatCurrency(total)}</span>
              },
            },
            {
              header: 'Trạng thái',
              accessor: (p: any) => getStatusHuyHieu(p.status),
            },
            {
              header: 'Ngày tạo',
              accessor: (p: any) => formatDateTime(new Date(p.createdAt)),
            },
            {
              header: 'Thao tác',
              accessor: (p: any) => (
                <div className="flex space-x-2">
                  <button onClick={() => navigate(`/purchases/${p.id || p._id}`)} className="p-2 text-blue-600 hover:bg-blue-50 rounded" title="Xem chi tiết">
                    <FileText size={16} />
                  </button>
                  {hasPermission('delete_product') && (
                    <button onClick={() => handleDelete(p.id || p._id)} className="p-2 text-red-600 hover:bg-red-50 rounded" title="Xóa">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ),
            },
          ]}
        />
        {filteredPurchases.length > 0 && (
          <PhanTrang
            currentPage={currentPage}
            totalItems={filteredPurchases.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
            itemsPerPageOptions={[10, 20, 50]}
          />
        )}
      </TheThongTin>
    </div>
  )
}