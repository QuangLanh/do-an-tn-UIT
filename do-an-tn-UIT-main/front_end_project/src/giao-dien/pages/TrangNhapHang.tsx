/**
 * TRANG QUẢN LÝ NHẬP HÀNG (TrangNhapHang.tsx)
 * - Đã fix lỗi hiển thị Tên Nhà Cung Cấp (thay vì ID hoặc trống)
 */

import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { NutBam } from '@/giao-dien/components/NutBam'
import { TheThongTin } from '@/giao-dien/components/TheThongTin'
import { HopThoai } from '@/giao-dien/components/HopThoai'
import { BangDuLieu } from '@/giao-dien/components/BangDuLieu'
import { PhanTrang } from '@/giao-dien/components/PhanTrang'
import { HuyHieu } from '@/giao-dien/components/HuyHieu'
import { NhapLieu } from '@/giao-dien/components/NhapLieu'
// API
import { purchaseApi } from '@/ha-tang/api/purchaseApi'
import { apiClient } from '@/ha-tang/api'
import { supplierApi } from '@/ha-tang/api/supplierApi' // 👈 Import thêm cái này
import { formatCurrency, formatDateTime } from '@/ha-tang/utils/formatters'
import { Plus, Search, FileText, Trash2, Truck, Bell } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/kho-trang-thai/khoXacThuc'
import { PurchaseRecommendation, PurchaseRecommendationItem } from '@/linh-vuc/purchases/entities/PurchaseRecommendation'

export const TrangNhapHang = () => {
  const [purchases, setPurchases] = useState<any[]>([]) // Dùng any cho linh hoạt
  const [suppliers, setSuppliers] = useState<any[]>([]) // 👈 State lưu danh sách NCC
  const [filteredPurchases, setFilteredPurchases] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isRecommendationsLoading, setIsRecommendationsLoading] = useState(false)
  const [recommendations, setRecommendations] = useState<PurchaseRecommendation | null>(null)
  const [isRecommendationModalOpen, setIsRecommendationModalOpen] = useState(false)
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false)
  const [receivingPurchase, setReceivingPurchase] = useState<any | null>(null)
  const [receiveChecklistItems, setReceiveChecklistItems] = useState<any[]>([])
  const [isReceiving, setIsReceiving] = useState(false)
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
      await loadRecommendations()

    } catch (error) {
      toast.error('Không thể tải dữ liệu')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  // 2. Hàm tra cứu tên NCC từ ID/name - lấy từ database suppliers
  const getSupplierName = (supplierInfo: any, purchase?: any) => {
    const raw = supplierInfo ?? purchase?.supplier ?? purchase?.supplierName ?? purchase?.supplierId
    if (!raw) return '---'
    if (typeof raw === 'object' && raw?.name) return raw.name
    const str = typeof raw === 'object' ? (raw._id || raw.id) : String(raw)
    if (!str) return '---'
    const foundById = suppliers.find((s: any) => (s.id || s._id) === str)
    if (foundById) return foundById.name
    const foundByName = suppliers.find((s: any) => s.name === str)
    if (foundByName) return foundByName.name
    return str
  }

  // 3. Filter tìm kiếm
  useEffect(() => {
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      const filtered = purchases.filter((p) => {
          // Tìm theo mã phiếu
          const codeMatch = (p.code || p.purchaseNumber || p.id)?.toLowerCase().includes(lowerQuery);
          // Tìm theo tên NCC (dùng hàm getSupplierName để tìm chính xác)
          const supName = getSupplierName(p.supplier, p).toLowerCase();
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

  const recommendedItems = useMemo(() => {
    if (!recommendations) return []
    return [
      ...recommendations.highPriority,
      ...recommendations.mediumPriority,
      ...recommendations.lowPriority,
    ].filter((item) => item.recommendedQuantity > 0)
  }, [recommendations])

  const recommendedNeedCount = useMemo(() => recommendedItems.length, [recommendedItems])

  const totalRecommendedAmount = useMemo(
    () =>
      recommendedItems.reduce(
        (sum, item) => sum + item.recommendedQuantity * Number(item.suggestedPurchasePrice || 0),
        0
      ),
    [recommendedItems]
  )

  const loadRecommendations = async () => {
    try {
      setIsRecommendationsLoading(true)
      const recommendationData = await purchaseApi.getRecommendations()
      setRecommendations(recommendationData)
    } catch (error) {
      setRecommendations(null)
      toast.error('Không thể tải danh sách sản phẩm cần nhập')
    } finally {
      setIsRecommendationsLoading(false)
    }
  }

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
      case 'received': return <HuyHieu variant="success">Đã nhận hàng</HuyHieu>
      case 'completed': return <HuyHieu variant="success">Đã nhận hàng</HuyHieu>
      case 'pending': return <HuyHieu variant="warning">Chờ nhận hàng</HuyHieu>
      case 'requesting': return <HuyHieu variant="warning">Chờ nhận hàng</HuyHieu>
      case 'cancelled': return <HuyHieu variant="danger">Đã hủy</HuyHieu>
      default: return <HuyHieu variant="warning">Đang xử lý</HuyHieu>
    }
  }

  const handleMarkCompleted = async (p: any) => {
    const srcItems = p.items || []
    if (!srcItems.length) {
      toast.error('Phiếu nhập không có sản phẩm để nhận')
      return
    }

    setReceivingPurchase(p)
    setReceiveChecklistItems(
      srcItems.map((it: any) => ({
        productId: String(it.productId || it.product?._id || it.product?.id || it.product || ''),
        productName: it.product?.name || it.productName || 'Sản phẩm',
        orderedQuantity: Number(it.orderedQuantity ?? it.quantity ?? 0),
        receivedQuantity: Number(it.quantity ?? 0),
        actualPurchasePrice: Number(it.unitPrice ?? it.purchasePrice ?? 0),
        manufactureDate: it.manufactureDate ? String(it.manufactureDate).slice(0, 10) : '',
        expiryDate: it.expiryDate ? String(it.expiryDate).slice(0, 10) : '',
        lotNumber: it.lotNumber || '',
      }))
    )
    setIsReceiveModalOpen(true)
  }

  const updateChecklistItem = (idx: number, patch: any) => {
    setReceiveChecklistItems((prev) => prev.map((item, i) => (i === idx ? { ...item, ...patch } : item)))
  }

  const handleConfirmReceive = async () => {
    if (!receivingPurchase) return
    const purchaseId = receivingPurchase.id || receivingPurchase._id
    if (!purchaseId) return

    for (const item of receiveChecklistItems) {
      if (Number(item.receivedQuantity) < 0) {
        toast.error(`Số lượng nhận của ${item.productName} phải >= 0`)
        return
      }
      if (!item.manufactureDate || !item.expiryDate) {
        toast.error(`Vui lòng nhập ngày SX và HSD cho ${item.productName}`)
        return
      }
      const mfg = new Date(item.manufactureDate)
      const exp = new Date(item.expiryDate)
      if (exp <= mfg) {
        toast.error(`HSD phải lớn hơn ngày SX (${item.productName})`)
        return
      }
    }

    try {
      setIsReceiving(true)
      await apiClient.patch(`/purchases/${purchaseId}/receive`, {
        items: receiveChecklistItems.map((it) => ({
          productId: it.productId,
          receivedQuantity: Number(it.receivedQuantity),
          actualPurchasePrice: Number(it.actualPurchasePrice),
          manufactureDate: it.manufactureDate,
          expiryDate: it.expiryDate,
          lotNumber: it.lotNumber || undefined,
        })),
      })
      toast.success('Đã nhận hàng và cập nhật tồn kho')
      setIsReceiveModalOpen(false)
      setReceivingPurchase(null)
      setReceiveChecklistItems([])
      loadData()
    } catch (error: any) {
      const msg = error?.response?.data?.message
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg || 'Không thể xác nhận nhận hàng')
    } finally {
      setIsReceiving(false)
    }
  }

  if (isLoading) return <div className="p-8 text-center">Đang tải dữ liệu...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quản lý nhập hàng</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Tổng số: {purchases.length} phiếu</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Thông báo số phiếu đang yêu cầu - đồng bộ style với nút hành động */}
          <button
            type="button"
            onClick={() => setIsRecommendationModalOpen(true)}
            className="inline-flex items-center px-3 py-2 rounded-lg border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-300 transition-colors"
            title="Xem danh sách sản phẩm cần nhập"
          >
            <Bell size={18} className="mr-2" />
            <span className="text-sm font-medium">{recommendedNeedCount} sản phẩm cần nhập</span>
          </button>
          <NutBam onClick={() => navigate('/purchases/new')}>
            <Plus size={20} className="mr-2" /> Tạo phiếu nhập
          </NutBam>
        </div>
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
              accessor: (p: any) => <span className="font-medium text-blue-600">{getSupplierName(p.supplier, p)}</span>,
            },
            {
              header: 'Tổng tiền dự kiến',
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
                <div className="flex space-x-2 items-center">
                  <button onClick={() => navigate(`/purchases/${p.id || p._id}`)} className="p-2 text-blue-600 hover:bg-blue-50 rounded" title="Xem chi tiết">
                    <FileText size={16} />
                  </button>
                  {(p.status === 'pending' || p.status === 'requesting') && hasPermission('create_purchase') && (
                    <button
                      onClick={() => handleMarkCompleted(p)}
                      className="inline-flex items-center gap-1 px-2 py-1 text-emerald-700 border border-emerald-300 rounded hover:bg-emerald-50"
                      title="Nhận hàng"
                    >
                      <Truck size={14} />
                      Nhận hàng
                    </button>
                  )}
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

      <HopThoai
        isOpen={isRecommendationModalOpen}
        onClose={() => setIsRecommendationModalOpen(false)}
        title="Sản phẩm cần nhập"
        size="lg"
      >
        {isRecommendationsLoading ? (
          <div className="py-8 text-center text-gray-500 dark:text-gray-400">
            Đang tải dữ liệu gợi ý...
          </div>
        ) : recommendedItems.length === 0 ? (
          <div className="py-8 text-center text-gray-500 dark:text-gray-400">
            Hiện chưa có sản phẩm cần nhập
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 text-left">
                    <th className="py-2 pr-2">Sản phẩm</th>
                    <th className="py-2 px-2">Tồn kho</th>
                    <th className="py-2 px-2">SL gợi ý nhập</th>
                    <th className="py-2 px-2">Đơn giá nhập</th>
                    <th className="py-2 pl-2 text-right">Tổng tiền SP</th>
                  </tr>
                </thead>
                <tbody>
                  {recommendedItems.map((item: PurchaseRecommendationItem) => {
                    const unitPrice = Number(item.suggestedPurchasePrice || 0)
                    const lineTotal = unitPrice * item.recommendedQuantity
                    return (
                      <tr key={`recommended-${item.productId}`} className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-2 pr-2">
                          <div className="font-medium text-gray-900 dark:text-white">{item.productName}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{item.reason}</div>
                        </td>
                        <td className="py-2 px-2">{item.currentStock}</td>
                        <td className="py-2 px-2 font-semibold text-amber-600 dark:text-amber-400">
                          {item.recommendedQuantity}
                        </td>
                        <td className="py-2 px-2">{formatCurrency(unitPrice)}</td>
                        <td className="py-2 pl-2 text-right font-semibold">{formatCurrency(lineTotal)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm">
                <span className="text-gray-600 dark:text-gray-400 mr-2">Tổng tiền gợi ý:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(totalRecommendedAmount)}
                </span>
              </div>
            </div>
          </div>
        )}
      </HopThoai>

      <HopThoai
        isOpen={isReceiveModalOpen}
        onClose={() => {
          if (isReceiving) return
          setIsReceiveModalOpen(false)
          setReceivingPurchase(null)
          setReceiveChecklistItems([])
        }}
        title="Nhận hàng thực tế"
        size="xl"
      >
        {!receivingPurchase ? null : (
          <div className="space-y-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Phiếu: <span className="font-semibold text-gray-900 dark:text-white">{receivingPurchase.purchaseNumber || receivingPurchase.code}</span>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="max-h-[52vh] overflow-auto">
                <table className="min-w-[980px] w-full text-sm table-fixed">
                  <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800 z-10">
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="py-3 px-3 text-left w-[28%]">Sản phẩm</th>
                      <th className="py-3 px-3 text-left w-[10%]">SL đặt</th>
                      <th className="py-3 px-3 text-left w-[12%]">SL nhận</th>
                      <th className="py-3 px-3 text-left w-[14%]">Giá thực tế</th>
                      <th className="py-3 px-3 text-left w-[18%]">Ngày SX</th>
                      <th className="py-3 px-3 text-left w-[18%]">Hạn SD</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receiveChecklistItems.map((item, idx) => {
                      const qtyDiff = Number(item.receivedQuantity) - Number(item.orderedQuantity)
                      return (
                        <tr key={`${item.productId}-${idx}`} className="border-b border-gray-100 dark:border-gray-800 align-top">
                          <td className="py-3 px-3">
                            <div className="font-medium text-gray-900 dark:text-white leading-5">{item.productName}</div>
                            {qtyDiff !== 0 && (
                              <div className={`mt-1 text-xs ${qtyDiff < 0 ? 'text-amber-600' : 'text-blue-600'}`}>
                                {qtyDiff < 0 ? `Thiếu ${Math.abs(qtyDiff)}` : `Dư ${qtyDiff}`} so với đặt
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-3 text-left font-semibold">{item.orderedQuantity}</td>
                          <td className="py-3 px-3">
                            <input
                              type="number"
                              min={0}
                              value={item.receivedQuantity}
                              onChange={(e) => updateChecklistItem(idx, { receivedQuantity: Number(e.target.value) })}
                              className="w-24 block text-left border border-gray-300 dark:border-gray-600 rounded-md py-1.5 px-2 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          </td>
                          <td className="py-3 px-3">
                            <input
                              type="number"
                              min={0}
                              value={item.actualPurchasePrice}
                              onChange={(e) => updateChecklistItem(idx, { actualPurchasePrice: Number(e.target.value) })}
                              className="w-32 block text-left border border-gray-300 dark:border-gray-600 rounded-md py-1.5 px-2 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          </td>
                          <td className="py-3 px-3">
                            <input
                              type="date"
                              value={item.manufactureDate}
                              onChange={(e) => updateChecklistItem(idx, { manufactureDate: e.target.value })}
                              className="w-full border border-gray-300 dark:border-gray-600 rounded-md py-1.5 px-2 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          </td>
                          <td className="py-3 px-3">
                            <input
                              type="date"
                              value={item.expiryDate}
                              onChange={(e) => updateChecklistItem(idx, { expiryDate: e.target.value })}
                              className="w-full border border-gray-300 dark:border-gray-600 rounded-md py-1.5 px-2 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <NutBam
                variant="secondary"
                onClick={() => {
                  setIsReceiveModalOpen(false)
                  setReceivingPurchase(null)
                  setReceiveChecklistItems([])
                }}
                disabled={isReceiving}
              >
                Hủy
              </NutBam>
              <NutBam onClick={handleConfirmReceive} isLoading={isReceiving}>
                Xác nhận nhận hàng
              </NutBam>
            </div>
          </div>
        )}
      </HopThoai>
    </div>
  )
}