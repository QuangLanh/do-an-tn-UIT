/**
 * Create Order Page
 * Trang tạo đơn hàng mới
 */

import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { OrderForm } from '@/ui/components/OrderForm'
import { Product } from '@/domains/products/entities/Product'
import { Order } from '@/domains/orders/entities/Order'
import { productApi } from '@/infra/api/productApi'
import { orderApi } from '@/infra/api/orderApi'
import toast from 'react-hot-toast'

export const CreateOrderPage = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [existingOrder, setExistingOrder] = useState<Order | undefined>(undefined)
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
      
      // If edit mode, load existing order
      if (isEditMode && id) {
        const order = await orderApi.service.getOrderById(id)
        if (order) {
          setExistingOrder(order)
        } else {
          toast.error('Không tìm thấy đơn hàng')
          navigate('/orders')
        }
      }
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Có lỗi xảy ra khi tải dữ liệu')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (orderData: any) => {
    try {
      if (isEditMode && id) {
        await orderApi.updateOrder.execute(id, orderData)
        toast.success('Cập nhật đơn hàng thành công')
      } else {
        await orderApi.createOrder.execute(orderData)
        toast.success('Tạo đơn hàng thành công')
      }
      navigate('/orders')
    } catch (error) {
      console.error('Error saving order:', error)
      toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra khi lưu đơn hàng')
    }
  }

  const handleCancel = () => {
    navigate('/orders')
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
          {isEditMode ? 'Chỉnh sửa đơn hàng' : 'Tạo đơn hàng mới'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {isEditMode
            ? `Chỉnh sửa đơn hàng ${existingOrder?.orderNumber}`
            : 'Điền thông tin để tạo đơn hàng mới'}
        </p>
      </div>

      {/* Order Form */}
      <OrderForm
        existingOrder={existingOrder}
        products={products}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  )
}
