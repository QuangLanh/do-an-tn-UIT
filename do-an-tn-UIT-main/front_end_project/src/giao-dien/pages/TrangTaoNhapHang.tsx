/**
 * Create Purchase Page
 * Trang tạo phiếu nhập hàng mới
 */

import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { BieuMauNhapHang } from '@/giao-dien/components/BieuMauNhapHang'
import { Product } from '@/linh-vuc/products/entities/Product'
import { Purchase } from '@/linh-vuc/purchases/entities/Purchase'
import { productApi } from '@/ha-tang/api/productApi'
import { purchaseApi } from '@/ha-tang/api/purchaseApi'
import toast from 'react-hot-toast'

export const TrangTaoNhapHang = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [existingPurchase, setExistingPurchase] = useState<Purchase | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = !!id

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    try {
      setIsLoading(true)
      
      // Load products
      const productsData = await productApi.getAllProducts.execute()
      setProducts(productsData)
      
      // If edit mode, load existing purchase
      if (isEditMode && id) {
        const purchase = await purchaseApi.service.getPurchaseById(id)
        if (purchase) {
          setExistingPurchase(purchase)
        } else {
          toast.error('Không tìm thấy phiếu nhập hàng')
          navigate('/purchases')
        }
      }
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Có lỗi xảy ra khi tải dữ liệu')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (purchaseData: any) => {
    try {
      if (isEditMode && id) {
        await purchaseApi.updatePurchase.execute(id, purchaseData)
        toast.success('Cập nhật phiếu nhập hàng thành công')
      } else {
        await purchaseApi.createPurchase.execute(purchaseData)
        toast.success('Tạo phiếu nhập hàng thành công')
      }
      navigate('/purchases')
    } catch (error) {
      console.error('Error saving purchase:', error)
      toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra khi lưu phiếu nhập hàng')
    }
  }

  const handleCancel = () => {
    navigate('/purchases')
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {isEditMode ? 'Chỉnh sửa phiếu nhập hàng' : 'Tạo phiếu nhập hàng mới'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {isEditMode
            ? `Chỉnh sửa phiếu nhập hàng ${existingPurchase?.purchaseNumber}`
            : 'Điền thông tin để tạo phiếu nhập hàng mới'}
        </p>
      </div>

      {/* Purchase Form */}
      <BieuMauNhapHang
        existingPurchase={existingPurchase}
        products={products}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  )
}
