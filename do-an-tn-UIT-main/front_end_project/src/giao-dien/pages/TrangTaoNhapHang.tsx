/**
 * TRANG TẠO PHIẾU NHẬP HÀNG (VERSION FINAL - NO ERRORS)
 * - Đã fix lỗi TypeScript 'Property supplier does not exist'
 * - Đã loại bỏ 'supplierName' để tránh lỗi Backend
 */
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { UserPlus, Truck } from 'lucide-react'
import toast from 'react-hot-toast'

// Component
import { BieuMauNhapHang } from '@/giao-dien/components/BieuMauNhapHang'
import { HopThoai } from '@/giao-dien/components/HopThoai'
import { NhapLieu } from '@/giao-dien/components/NhapLieu'
import { NutBam } from '@/giao-dien/components/NutBam'
import { TheThongTin } from '@/giao-dien/components/TheThongTin'

// API Clients
import { apiClient } from '@/ha-tang/api/index'
import { purchaseApi } from '@/ha-tang/api/purchaseApi'
import { supplierApi } from '@/ha-tang/api/supplierApi'
import { normalizePhoneInput, isValidPhone10 } from '@/ha-tang/utils/formatters'

// Types
import { Purchase } from '@/linh-vuc/purchases/entities/Purchase'
import { PurchaseRecommendation } from '@/linh-vuc/purchases/entities/PurchaseRecommendation'
import { Supplier } from '@/linh-vuc/suppliers/entities/Supplier'
import { useProductStore } from '@/kho-trang-thai/khoSanPham'

export const TrangTaoNhapHang = () => {
  const { products, loadProducts } = useProductStore()
  const [suppliers, setSuppliers] = useState<Supplier[]>([]) 
  const [selectedSupplierId, setSelectedSupplierId] = useState('') 
  const [existingPurchase, setExistingPurchase] = useState<Purchase | undefined>(undefined)
  const [recommendations, setRecommendations] = useState<PurchaseRecommendation | null>(null)
  const [isRecommendationLoading, setIsRecommendationLoading] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  // Modal Thêm NCC
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newSupplier, setNewSupplier] = useState({ name: '', phone: '', address: '' })

  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = !!id
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  useEffect(() => {
    loadData()
  }, [id, refreshKey])

  const loadData = async () => {
    try {
      setIsLoading(true)
      setIsRecommendationLoading(true)
      const [, suppliersData] = await Promise.all([
        loadProducts(),
        supplierApi.getAll.execute()
      ])
      setSuppliers(suppliersData)
      try {
        const recommendationData = await purchaseApi.getRecommendations()
        setRecommendations(recommendationData)
      } catch (error) {
        setRecommendations(null)
        toast.error('Không thể tải gợi ý nhập hàng')
      } finally {
        setIsRecommendationLoading(false)
      }

      if (isEditMode && id) {
        const purchase = await purchaseApi.service.getPurchaseById(id)
        if (purchase) {
            setExistingPurchase(purchase)
            const rawSup = (purchase as any).supplier
            let supId = typeof rawSup === 'object' ? (rawSup?._id || rawSup?.id) : (purchase.supplierId || rawSup)
            if (!supId && purchase.supplierName && suppliersData?.length) {
              const byName = (suppliersData as any[]).find(
                (s) => (s.name || '').toLowerCase() === (purchase.supplierName || '').toLowerCase()
              )
              supId = byName?.id || byName?._id || ''
            }
            setSelectedSupplierId(supId || '')
        } else {
            navigate('/purchases')
        }
      }
    } catch (error) {
      toast.error('Lỗi tải dữ liệu ban đầu')
    } finally {
      setIsLoading(false)
    }
  }

  // =========================================================
  // 👇 HÀM XỬ LÝ GỬI DỮ LIỆU (TUÂN THỦ CHẶT CHẼ BACKEND)
  // =========================================================
  const handleSubmit = async (purchaseDataFromChild: any) => {
    try {
      if (!selectedSupplierId) {
        toast.error("Vui lòng chọn Nhà cung cấp!");
        return;
      }

      // 1. CHUẨN HÓA ITEMS
      const rawItems = purchaseDataFromChild.items || [];
      const cleanItems = rawItems.map((item: any, index: number) => {
          const prodObj = item.product || {};
          let rawId = item.productId ?? prodObj.id ?? prodObj._id;
          if (rawId == null || rawId === '') {
            const prodName = prodObj.name || item.productName;
            if (prodName && products?.length) {
              const found = products.find((p: any) => (p.name || '').toLowerCase() === String(prodName).toLowerCase());
              rawId = found?.id;
            }
          }
          const realId = rawId != null && rawId !== '' ? String(rawId).trim() : '';
          
          if (!realId) throw new Error(`Sản phẩm dòng ${index + 1} (${(prodObj.name || item.productName) || '?'}) lỗi ID.`);

          return {
              productId: String(realId),
              quantity: Number(item.quantity),
              // Backend bắt buộc dùng 'purchasePrice', không được dùng 'importPrice'
              purchasePrice: Number(item.unitPrice || item.importPrice || 0)
          };
      });

      // 2. TẠO PAYLOAD
      // ❌ Đã xóa 'supplierName' vì Backend cấm gửi lên
      const finalPayload = {
          supplier: String(selectedSupplierId), 
          items: cleanItems,
          notes: purchaseDataFromChild.notes || "",
      };

      // 3. GỬI API TRỰC TIẾP
      if (isEditMode && id) {
        await apiClient.patch(`/purchases/${id}`, finalPayload);
        toast.success('Cập nhật thành công!')
      } else {
        await apiClient.post('/purchases', finalPayload);
        toast.success('Tạo phiếu nhập thành công!')
      }
      
      navigate('/purchases')

    } catch (error: any) {
      console.error("❌ Lỗi API:", error);
      const msg = error.response?.data?.message || error.message;
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg);
      throw error; 
    }
  }

  const handleMarkCompleted = async () => {
    if (!id || !existingPurchase) return
    if (!confirm('Đánh dấu phiếu này đã nhận hàng? Hệ thống sẽ cập nhật tồn kho.')) return
    try {
      setIsUpdatingStatus(true)
      await apiClient.patch(`/purchases/${id}`, { status: 'completed' })
      toast.success('Đã đánh dấu hoàn thành')
      setRefreshKey((k) => k + 1)
      loadData()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể cập nhật')
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  // --- Xử lý thêm nhanh NCC ---
  const handleQuickAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault()
    if(!newSupplier.name || !newSupplier.phone) return toast.error("Thiếu tên hoặc SĐT")
    if (!isValidPhone10(newSupplier.phone)) {
      toast.error('Số điện thoại phải đúng 10 số (ví dụ: 0123456789).')
      return
    }
    try {
        const randomCode = `NCC${Math.floor(1000 + Math.random() * 9000)}`;
        const res = await apiClient.post('/suppliers', {
            code: randomCode,
            name: newSupplier.name,
            phone: newSupplier.phone,
            address: newSupplier.address
        });
        
        toast.success("Đã thêm NCC mới!")
        setIsModalOpen(false)
        setNewSupplier({ name: '', phone: '', address: '' })
        setRefreshKey(prev => prev + 1)
        
        const newId = res.data.id || res.data._id;
        setSelectedSupplierId(newId)
        
    } catch (error) {
        toast.error("Lỗi thêm NCC")
    }
  }

  if (isLoading) return <div className="p-8 text-center">Đang tải dữ liệu...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
           <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
             {isEditMode ? 'Sửa phiếu nhập' : 'Tạo phiếu nhập mới'}
           </h1>
           <p className="text-gray-500 mt-1">Quản lý nhập kho hàng hóa</p>
        </div>
      </div>

      {isEditMode && existingPurchase?.status === 'requesting' && (
        <TheThongTin title="Đang yêu cầu nhà cung cấp giao hàng">
          <div className="flex items-center justify-between">
            <p className="text-amber-800 dark:text-amber-200 text-sm">
              Phiếu ở trạng thái <strong>Đang yêu cầu</strong>. Khi nhà cung cấp đã giao hàng, bấm nút bên dưới để đánh dấu hoàn thành → cập nhật tồn kho và báo cáo doanh thu, lợi nhuận.
            </p>
            <NutBam onClick={handleMarkCompleted} disabled={isUpdatingStatus} isLoading={isUpdatingStatus}>
              <Truck size={18} className="mr-2" /> Đánh dấu đã nhận hàng
            </NutBam>
          </div>
        </TheThongTin>
      )}

      <TheThongTin title="Thông tin Nhà cung cấp">
        <div className="space-y-3">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nhà cung cấp *
              </label>
              <select 
                className="w-full p-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg"
                value={selectedSupplierId} 
                onChange={e => setSelectedSupplierId(e.target.value)}
              >
                <option value="">-- Chọn nhà cung cấp --</option>
                {suppliers.map(s => {
                  const sId = s.id || (s as any)._id
                  return <option key={sId} value={sId}>{s.name} - {s.phone}</option>
                })}
              </select>
            </div>
            <NutBam type="button" onClick={() => setIsModalOpen(true)} variant="secondary" className="h-[42px]">
              <UserPlus size={18} className="mr-2"/> Thêm NCC
            </NutBam>
          </div>
          {selectedSupplierId && (() => {
            const sel = suppliers.find(s => (s.id || (s as any)._id) === selectedSupplierId)
            return sel ? (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Đã chọn: <span className="font-medium text-gray-900 dark:text-white">{sel.name}</span>
                {sel.phone && <span className="ml-1">— {sel.phone}</span>}
              </p>
            ) : null
          })()}
        </div>
      </TheThongTin>

      <BieuMauNhapHang
        key={refreshKey}
        existingPurchase={existingPurchase}
        products={products}
        recommendations={recommendations}
        isRecommendationLoading={isRecommendationLoading}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/purchases')}
      />

      <HopThoai isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Thêm Nhà Cung Cấp">
        <form onSubmit={handleQuickAddSupplier} className="space-y-4">
          <NhapLieu label="Tên NCC *" value={newSupplier.name} onChange={e => setNewSupplier({...newSupplier, name: e.target.value})} required />
          <NhapLieu
            label="SĐT *"
            type="tel"
            inputMode="numeric"
            maxLength={10}
            placeholder="0xxxxxxxxx (10 số)"
            value={newSupplier.phone}
            onChange={e => setNewSupplier({...newSupplier, phone: normalizePhoneInput(e.target.value)})}
            required
          />
          <NhapLieu label="Địa chỉ" value={newSupplier.address} onChange={e => setNewSupplier({...newSupplier, address: e.target.value})} />
          <div className="flex justify-end gap-3 pt-4">
            <NutBam type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Hủy</NutBam>
            <NutBam type="submit">Lưu</NutBam>
          </div>
        </form>
      </HopThoai>
    </div>
  )
}