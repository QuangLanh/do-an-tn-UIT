/**
 * Sales Page
 * Trang bán hàng - sử dụng trực tiếp BieuMauDonHang
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BieuMauDonHang } from '@/giao-dien/components/BieuMauDonHang'
import { Product } from '@/linh-vuc/products/entities/Product'
import { productApi } from '@/ha-tang/api/productApi'
import { orderApi } from '@/ha-tang/api/orderApi'
import toast from 'react-hot-toast'

export const TrangBanHang = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setIsLoading(true)
      const productsData = await productApi.getAllProducts.execute()
      setProducts(productsData)
    } catch (error) {
      console.error('Error loading products:', error)
      toast.error('Có lỗi xảy ra khi tải danh sách sản phẩm')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (orderData: any) => {
    try {
      await orderApi.createOrder.execute(orderData)
      toast.success('Tạo đơn hàng thành công')
      // Reset form bằng cách reload trang
      window.location.reload()
    } catch (error) {
      console.error('Error saving order:', error)
      toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra khi lưu đơn hàng')
    }
  }

  const handleCancel = () => {
    // Không làm gì, chỉ reset form
    window.location.reload()
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Bán hàng</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Tạo đơn hàng mới - Chọn loại khách hàng và thêm sản phẩm
        </p>
      </div>

      {/* Order Form */}
      <BieuMauDonHang
        products={products}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        defaultCustomerType="retail"
      />
    </div>
  )
}