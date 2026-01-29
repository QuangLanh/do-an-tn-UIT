/**
 * TRANG TẠO PHIẾU NHẬP HÀNG (VERSION FINAL - NO ERRORS)
 * - Đã fix lỗi TypeScript 'Property supplier does not exist'
 * - Đã loại bỏ 'supplierName' để tránh lỗi Backend
 */
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { UserPlus } from 'lucide-react'
import toast from 'react-hot-toast'

// Component
import { BieuMauNhapHang } from '@/giao-dien/components/BieuMauNhapHang'
import { HopThoai } from '@/giao-dien/components/HopThoai'
import { NhapLieu } from '@/giao-dien/components/NhapLieu'
import { NutBam } from '@/giao-dien/components/NutBam'
import { TheThongTin } from '@/giao-dien/components/TheThongTin'

// API Clients
import { apiClient } from '@/ha-tang/api/index'
import { productApi } from '@/ha-tang/api/productApi'
import { purchaseApi } from '@/ha-tang/api/purchaseApi'
import { supplierApi } from '@/ha-tang/api/supplierApi'
import { normalizePhoneInput, isValidPhone10 } from '@/ha-tang/utils/formatters'

// Types
import { Product } from '@/linh-vuc/products/entities/Product'
import { Purchase } from '@/linh-vuc/purchases/entities/Purchase'
import { Supplier } from '@/linh-vuc/suppliers/entities/Supplier'

export const TrangTaoNhapHang = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([]) 
  const [selectedSupplierId, setSelectedSupplierId] = useState('') 
  const [existingPurchase, setExistingPurchase] = useState<Purchase | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  // Modal Thêm NCC
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newSupplier, setNewSupplier] = useState({ name: '', phone: '', address: '' })

  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = !!id

  useEffect(() => {
    loadData()
  }, [id, refreshKey])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [productsData, suppliersData] = await Promise.all([
        productApi.getAllProducts.execute(),
        supplierApi.getAll.execute()
      ])
      setProducts(productsData)
      setSuppliers(suppliersData)

      if (isEditMode && id) {
        const purchase = await purchaseApi.service.getPurchaseById(id)
        if (purchase) {
            setExistingPurchase(purchase)
            
            // 👇 FIX LỖI TYPESCRIPT Ở ĐÂY: Ép kiểu sang 'any' để lấy dữ liệu an toàn
            const rawSup = (purchase as any).supplier;
            const supId = typeof rawSup === 'object' ? (rawSup?._id || rawSup?.id) : rawSup;
            
            // Ưu tiên lấy từ supplier object, nếu không có thì lấy supplierId
            setSelectedSupplierId(supId || purchase.supplierId || '') 
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
          const realId = item.productId || prodObj.id || prodObj._id;
          
          if (!realId) throw new Error(`Sản phẩm dòng ${index + 1} lỗi ID.`);

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

      console.log("🚀 GỬI ĐI (CLEAN):", finalPayload);

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

      <TheThongTin title="Thông tin Nhà cung cấp">
        <div className="flex gap-4 items-end">
            <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nhà cung cấp *
                </label>
                <select 
                    className="w-full p-2.5 bg-white border border-gray-300 text-gray-900 text-sm rounded-lg"
                    value={selectedSupplierId} 
                    onChange={e => setSelectedSupplierId(e.target.value)}
                >
                    <option value="">-- Chọn nhà cung cấp --</option>
                    {suppliers.map(s => {
                        const sId = s.id || (s as any)._id;
                        return <option key={sId} value={sId}>{s.name} - {s.phone}</option>
                    })}
                </select>
            </div>
            <NutBam type="button" onClick={() => setIsModalOpen(true)} variant="secondary" className="h-[42px]">
                <UserPlus size={18} className="mr-2"/> Thêm NCC
            </NutBam>
        </div>
      </TheThongTin>

      <BieuMauNhapHang
        key={refreshKey}
        existingPurchase={existingPurchase}
        products={products}
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