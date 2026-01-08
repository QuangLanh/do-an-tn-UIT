/**
 * Order Form Component
 * Component form tạo và chỉnh sửa đơn hàng
 */

import { useState, useEffect, useMemo } from 'react'
import { NutBam } from './NutBam'
import { NhapLieu } from './NhapLieu'
import { TheThongTin } from './TheThongTin'
import { BangDuLieu } from './BangDuLieu'
import { HuyHieu } from './HuyHieu'
import { PhanTrang } from './PhanTrang'
import { Product } from '@/linh-vuc/products/entities/Product'
import { OrderItem, Order } from '@/linh-vuc/orders/entities/Order'
import { orderApi } from '@/ha-tang/api/orderApi'
import { formatCurrency } from '@/ha-tang/utils/formatters'
import { Plus, Minus, Trash2, Search } from 'lucide-react'
import toast from 'react-hot-toast'

interface BieuMauDonHangProps {
  existingOrder?: Order
  products: Product[]
  onSubmit: (order: any) => void
  onCancel: () => void
}

export const BieuMauDonHang = ({
  existingOrder,
  products,
  onSubmit,
  onCancel,
}: BieuMauDonHangProps) => {
  const [items, setItems] = useState<OrderItem[]>(existingOrder?.items || [])
  const [customerName, setCustomerName] = useState(existingOrder?.customerName || '')
  const [customerPhone, setCustomerPhone] = useState(existingOrder?.customerPhone || '')
  const [notes, setNotes] = useState(existingOrder?.notes || '')
  const [discount, setDiscount] = useState(existingOrder?.discount || 0)
  // Sửa lỗi hiển thị thuế: Tính ngược từ Tiền ra Phần trăm
  const [tax, setTax] = useState(() => {
    if (existingOrder && existingOrder.totalAmount > 0) {
      // Công thức: (Tiền thuế / Tổng tiền hàng) * 100
      // Ví dụ: (49.000 / 490.000) * 100 = 10%
      return Math.round((existingOrder.tax / existingOrder.totalAmount) * 100)
    }
    return 0
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)

  useEffect(() => {
    if (searchQuery) {
      const filtered = products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredProducts(filtered)
    } else {
      setFilteredProducts(products)
    }
    // Reset về trang 1 khi tìm kiếm
    setCurrentPage(1)
  }, [searchQuery, products])

  // Tính toán dữ liệu phân trang
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredProducts.slice(startIndex, endIndex)
  }, [filteredProducts, currentPage, itemsPerPage])

  const handleAddItem = (product: Product) => {
    // Kiểm tra nếu sản phẩm đã có trong đơn hàng
    const existingItemIndex = items.findIndex(item => item.productId === product.id)
    
    if (existingItemIndex >= 0) {
      // Tăng số lượng nếu sản phẩm đã có
      const updatedItems = [...items]
      const item = updatedItems[existingItemIndex]
      
      // Kiểm tra tồn kho
      if (item.quantity + 1 > product.stock) {
        toast.error(`Chỉ còn ${product.stock} ${product.unit} trong kho`)
        return
      }
      
      updatedItems[existingItemIndex] = {
        ...item,
        quantity: item.quantity + 1,
        subtotal: (item.quantity + 1) * item.unitPrice
      }
      setItems(updatedItems)
    } else {
      // Kiểm tra tồn kho
      if (product.stock <= 0) {
        toast.error(`Sản phẩm ${product.name} đã hết hàng`)
        return
      }
      
      // Thêm sản phẩm mới vào đơn hàng
      const newItem = orderApi.service.createOrderItem(product, 1)
      setItems([...items, newItem])
    }
  }

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    const updatedItems = items.map(item => {
      if (item.id === itemId) {
        // Kiểm tra tồn kho
        if (newQuantity > item.product.stock) {
          toast.error(`Chỉ còn ${item.product.stock} ${item.product.unit} trong kho`)
          return item
        }
        
        if (newQuantity <= 0) {
          toast.error('Số lượng phải lớn hơn 0')
          return item
        }
        
        return {
          ...item,
          quantity: newQuantity,
          subtotal: newQuantity * item.unitPrice
        }
      }
      return item
    })
    
    setItems(updatedItems)
  }

  const handleRemoveItem = (itemId: string) => {
    setItems(items.filter(item => item.id !== itemId))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (items.length === 0) {
      toast.error('Đơn hàng phải có ít nhất một sản phẩm')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Tính toán tổng tiền
      const { subtotal, tax: calculatedTax, finalAmount } = orderApi.service.calculateOrderTotals(
        items, 
        discount,
        tax
      )
      
      const orderData = {
        id: existingOrder?.id,
        items,
        customerName,
        customerPhone,
        notes,
        discount,
        tax: calculatedTax,
        totalAmount: subtotal,
        finalAmount,
        status: existingOrder?.status || 'completed',
      }
      
      onSubmit(orderData)
    } catch (error) {
      console.error('Error submitting order:', error)
      toast.error('Có lỗi xảy ra khi lưu đơn hàng')
      setIsSubmitting(false)
    }
  }

  // Tính tổng tiền đơn hàng
  const { subtotal, tax: calculatedTax, finalAmount } = orderApi.service.calculateOrderTotals(
    items,
    discount,
    tax
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Thông tin khách hàng */}
      <TheThongTin title="Thông tin khách hàng">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <NhapLieu
            label="Tên khách hàng"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Nhập tên khách hàng"
          />
          <NhapLieu
            label="Số điện thoại"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            placeholder="Nhập số điện thoại"
          />
        </div>
      </TheThongTin>

      {/* Danh sách sản phẩm trong đơn hàng */}
      <TheThongTin title="Sản phẩm trong đơn hàng">
          {items.length === 0 ? (
          <div className="text-center py-6 text-gray-500 dark:text-gray-400">
            Chưa có sản phẩm nào trong đơn hàng
          </div>
        ) : (
          <BangDuLieu
            data={items}
            columns={[
              {
                header: 'Sản phẩm',
                accessor: (item: OrderItem) => item.product.name,
              },
              {
                header: 'Đơn giá',
                accessor: (item: OrderItem) => formatCurrency(item.unitPrice),
              },
              {
                header: 'Số lượng',
                accessor: (item: OrderItem) => (
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                      className="p-1 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-10 text-center">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      className="p-1 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                ),
              },
              {
                header: 'Thành tiền',
                accessor: (item: OrderItem) => formatCurrency(item.subtotal),
              },
              {
                header: 'Thao tác',
                accessor: (item: OrderItem) => (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded"
                  >
                    <Trash2 size={18} />
                  </button>
                ),
              },
            ]}
          />
        )}

        {/* Tổng cộng */}
        <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-600 dark:text-gray-400">Tổng tiền hàng:</span>
            <span className="font-medium">{formatCurrency(subtotal)}</span>
          </div>
          
          <div className="flex justify-between items-center py-2">
            <div className="flex items-center">
              <span className="text-gray-600 dark:text-gray-400 mr-2">Giảm giá:</span>
              <NhapLieu
                type="number"
                // Sửa 1: Chuyển về chuỗi để hiển thị chính xác
                value={discount.toString()}
                onChange={(e) => {
                  const val = e.target.value;
                  // Sửa 2: Nếu xóa hết thì về 0, nếu nhập số thì dùng parseInt để bỏ số 0 ở đầu
                  setDiscount(val === '' ? 0 : parseInt(val, 10));
                }}
                className="w-32 py-1"
                min={0}
              />
            </div>
            <span className="font-medium">{formatCurrency(discount)}</span>
          </div>
          
          <div className="flex justify-between items-center py-2">
            <div className="flex items-center">
              <span className="text-gray-600 dark:text-gray-400 mr-2">Thuế (%):</span>
              <NhapLieu
                type="number"
                value={tax.toString()}
                onChange={(e) => {
                  const val = e.target.value;
                  setTax(val === '' ? 0 : parseInt(val, 10));
                }}
                className="w-32 py-1"
                min={0}
                max={100}
              />
            </div>
            <span className="font-medium">{formatCurrency(calculatedTax)}</span>
          </div>
          
          <div className="flex justify-between items-center py-2 text-lg font-bold">
            <span>Tổng thanh toán:</span>
            <span className="text-primary-600 dark:text-primary-400">{formatCurrency(finalAmount)}</span>
          </div>
        </div>
      </TheThongTin>

      {/* Tìm kiếm sản phẩm để thêm vào đơn hàng */}
      <TheThongTin title="Thêm sản phẩm vào đơn hàng">
        <div className="mb-4 relative">
          <Search
            size={20}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <NhapLieu
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedProducts.map((product) => (
            <div
              key={product.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Ảnh sản phẩm */}
              <div className="w-full h-32 bg-gray-100 dark:bg-gray-700 overflow-hidden">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500 text-xs">
                    Chưa có ảnh
                  </div>
                )}
              </div>

              {/* Thông tin */}
              <div className="p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">{product.name}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {formatCurrency(product.salePrice)} / {product.unit}
                </p>
                <div className="mb-3">
                  {product.stock > 0 ? (
                    <HuyHieu variant={product.stock < 10 ? 'warning' : 'success'}>
                      Còn {product.stock} {product.unit}
                    </HuyHieu>
                  ) : (
                    <HuyHieu variant="danger">Hết hàng</HuyHieu>
                  )}
                </div>
                <NutBam
                  type="button"
                  onClick={() => handleAddItem(product)}
                  size="sm"
                  disabled={product.stock <= 0}
                  className="w-full"
                >
                  <Plus size={16} className="mr-1" /> Thêm
                </NutBam>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {filteredProducts.length > 0 && (
          <PhanTrang
            currentPage={currentPage}
            totalItems={filteredProducts.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
            itemsPerPageOptions={[12, 24, 48, 96]}
          />
        )}
      </TheThongTin>

      {/* Ghi chú */}
      <TheThongTin title="Ghi chú">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="input-field min-h-[100px]"
          placeholder="Nhập ghi chú cho đơn hàng (nếu có)..."
        />
      </TheThongTin>

      {/* Buttons */}
      <div className="flex justify-end space-x-4">
        <NutBam type="button" variant="secondary" onClick={onCancel}>
          Hủy
        </NutBam>
        <NutBam type="submit" isLoading={isSubmitting}>
          {existingOrder ? 'Cập nhật đơn hàng' : 'Tạo đơn hàng'}
        </NutBam>
      </div>
    </form>
  )
}
