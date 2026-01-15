/**
 * Order Form Component
 * Component form tạo và chỉnh sửa đơn hàng
 */

import { useState, useEffect, useMemo, useRef } from 'react'
import { NutBam } from './NutBam'
import { NhapLieu } from './NhapLieu'
import { TheThongTin } from './TheThongTin'
import { BangDuLieu } from './BangDuLieu'
import { HuyHieu } from './HuyHieu'
import { PhanTrang } from './PhanTrang'
import { Product } from '@/linh-vuc/products/entities/Product'
import { OrderItem, Order } from '@/linh-vuc/orders/entities/Order'
import { orderApi } from '@/ha-tang/api/orderApi'
import { productApi } from '@/ha-tang/api/productApi'
import { formatCurrency } from '@/ha-tang/utils/formatters'
import { Plus, Minus, Trash2, Search, User, UserCheck } from 'lucide-react'
import toast from 'react-hot-toast'

type CustomerType = 'retail' | 'vip'

interface BieuMauDonHangProps {
  existingOrder?: Order
  products: Product[]
  onSubmit: (order: any) => void
  onCancel: () => void
  defaultCustomerType?: CustomerType
}

export const BieuMauDonHang = ({
  existingOrder,
  products,
  onSubmit,
  onCancel,
  defaultCustomerType = 'retail',
}: BieuMauDonHangProps) => {
  const [items, setItems] = useState<OrderItem[]>(existingOrder?.items || [])
  const [customerType, setCustomerType] = useState<CustomerType>(
    existingOrder?.customerName ? 'vip' : defaultCustomerType
  )
  const [customerName, setCustomerName] = useState(existingOrder?.customerName || '')
  const [customerPhone, setCustomerPhone] = useState(existingOrder?.customerPhone || '')
  const [notes, setNotes] = useState(existingOrder?.notes || '')
  const [discount, setDiscount] = useState(existingOrder?.discount || 0)
  const [tax, setTax] = useState(existingOrder?.tax || 0)
  const [isDebt, setIsDebt] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)
  const [barcode, setBarcode] = useState('')
  const [barcodeQuantity, setBarcodeQuantity] = useState(1)
  const barcodeInputRef = useRef<HTMLInputElement | null>(null)
  const barcodeDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastProcessedBarcodeRef = useRef<string | null>(null)
  const isProcessingBarcodeRef = useRef(false)

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

  const addProductToOrder = (product: Product, qty: number) => {
    const quantityToAdd = Math.max(1, Math.floor(Number(qty || 1)))

    // Kiểm tra tồn kho
    if (product.stock <= 0) {
      toast.error(`Sản phẩm ${product.name} đã hết hàng`)
      return
    }

    if (quantityToAdd > product.stock) {
      toast.error(`Chỉ còn ${product.stock} ${product.unit} trong kho`)
      return
    }

    // Kiểm tra nếu sản phẩm đã có trong đơn hàng
    const existingItemIndex = items.findIndex(item => item.productId === product.id)

    if (existingItemIndex >= 0) {
      const updatedItems = [...items]
      const item = updatedItems[existingItemIndex]

      const newQuantity = item.quantity + quantityToAdd
      if (newQuantity > product.stock) {
        toast.error(`Chỉ còn ${product.stock} ${product.unit} trong kho`)
        return
      }

      const unitPrice = product.salePrice
      updatedItems[existingItemIndex] = {
        ...item,
        productId: product.id,
        product,
        unitPrice,
        quantity: newQuantity,
        subtotal: newQuantity * unitPrice,
      }
      setItems(updatedItems)
    } else {
      const newItem = orderApi.service.createOrderItem(product, quantityToAdd)
      setItems([...items, newItem])
    }
  }

  const handleAddItem = (product: Product) => {
    addProductToOrder(product, 1)
  }

  const xuLyBarcode = async (rawBarcode?: string) => {
    const code = (rawBarcode ?? barcode).trim()
    if (!code) return

    // Tránh xử lý trùng do vừa debounce vừa Enter
    if (lastProcessedBarcodeRef.current === code) return
    if (isProcessingBarcodeRef.current) return

    isProcessingBarcodeRef.current = true
    lastProcessedBarcodeRef.current = code

    try {
      const product = await productApi.service.getProductByBarcode(code)
      if (!product) {
        toast.error(`Không tìm thấy sản phẩm với barcode: ${code}`)
        return
      }

      addProductToOrder(product, barcodeQuantity)
      setBarcode('')

      // Focus lại để quét liên tục
      barcodeInputRef.current?.focus()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể xử lý barcode'
      toast.error(message)
    } finally {
      isProcessingBarcodeRef.current = false
      // Cho phép quét lại cùng barcode nếu cần
      setTimeout(() => {
        if (lastProcessedBarcodeRef.current === code) {
          lastProcessedBarcodeRef.current = null
        }
      }, 300)
    }
  }

  // Clear barcode khi chuyển đổi loại khách hàng
  useEffect(() => {
    setBarcode('')
    lastProcessedBarcodeRef.current = null
    if (barcodeDebounceRef.current) {
      clearTimeout(barcodeDebounceRef.current)
      barcodeDebounceRef.current = null
    }
  }, [customerType])

  // Auto xử lý barcode (phù hợp máy quét: nhập rất nhanh như bàn phím)
  useEffect(() => {
    if (barcodeDebounceRef.current) {
      clearTimeout(barcodeDebounceRef.current)
      barcodeDebounceRef.current = null
    }

    const code = barcode.trim()
    if (!code) return

    // Demo: chỉ auto nếu trông giống barcode (chủ yếu là số, dài >= 8)
    const looksLikeBarcode = /^\d{8,}$/.test(code)
    if (!looksLikeBarcode) return

    barcodeDebounceRef.current = setTimeout(() => {
      xuLyBarcode(code)
    }, 250)

    return () => {
      if (barcodeDebounceRef.current) {
        clearTimeout(barcodeDebounceRef.current)
        barcodeDebounceRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [barcode])

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
    
    // Validation: Nếu là khách hàng thân thiết, bắt buộc phải nhập tên và số điện thoại
    if (customerType === 'vip') {
      if (!customerName || customerName.trim() === '') {
        toast.error('Vui lòng nhập tên khách hàng')
        return
      }
      if (!customerPhone || customerPhone.trim() === '') {
        toast.error('Vui lòng nhập số điện thoại khách hàng')
        return
      }
    }
    
    setIsSubmitting(true)
    
    try {
      // Tính toán tổng tiền
      // Nếu là khách hàng lẻ, discount và tax = 0
      const finalDiscount = customerType === 'retail' ? 0 : discount
      const finalTax = customerType === 'retail' ? 0 : tax
      
      const { subtotal, tax: calculatedTax, finalAmount } = orderApi.service.calculateOrderTotals(
        items, 
        finalDiscount,
        finalTax
      )
      
      const orderData = {
        id: existingOrder?.id,
        items,
        customerName: customerType === 'vip' ? customerName.trim() : '',
        customerPhone: customerType === 'vip' ? customerPhone.trim() : '',
        notes,
        discount: finalDiscount,
        tax: calculatedTax,
        totalAmount: subtotal,
        finalAmount,
        status: existingOrder?.status || 'completed',
        isDebt: customerType === 'vip' ? isDebt : false, // Chỉ cho phép ghi nợ với khách hàng thân thiết
      }
      
      onSubmit(orderData)
    } catch (error) {
      console.error('Error submitting order:', error)
      toast.error('Có lỗi xảy ra khi lưu đơn hàng')
      setIsSubmitting(false)
    }
  }

  // Tính tổng tiền đơn hàng
  // Nếu là khách hàng lẻ, discount và tax = 0
  const finalDiscount = customerType === 'retail' ? 0 : discount
  const finalTax = customerType === 'retail' ? 0 : tax
  
  const { subtotal, tax: calculatedTax, finalAmount } = orderApi.service.calculateOrderTotals(
    items,
    finalDiscount,
    finalTax
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Chuyển đổi loại khách hàng */}
      <div className="flex justify-end">
        <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setCustomerType('retail')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
              customerType === 'retail'
                ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <User size={18} />
            <span>Khách hàng lẻ</span>
          </button>
          <button
            type="button"
            onClick={() => setCustomerType('vip')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
              customerType === 'vip'
                ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <UserCheck size={18} />
            <span>Khách hàng thân thiết</span>
          </button>
        </div>
      </div>

      {/* Thông tin khách hàng - chỉ hiển thị khi là khách hàng thân thiết */}
      {customerType === 'vip' && (
        <TheThongTin title="Thông tin khách hàng">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <NhapLieu
              label="Tên khách hàng *"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Nhập tên khách hàng"
              required
            />
            <NhapLieu
              label="Số điện thoại *"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="Nhập số điện thoại"
              required
            />
          </div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            * Bắt buộc nhập khi chọn khách hàng thân thiết
          </p>
        </TheThongTin>
      )}

      {/* Nhập số lượng và nhập/quét barcode để thêm nhanh vào đơn hàng */}
      <TheThongTin title="Quét / nhập barcode">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          <NhapLieu
            label="Số lượng"
            type="number"
            min={1}
            value={barcodeQuantity}
            onChange={(e) => setBarcodeQuantity(Number(e.target.value) || 1)}
          />
          <div className="md:col-span-2">
            <NhapLieu
              ref={barcodeInputRef}
              label="Barcode"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Nhập hoặc quét barcode..."
              value={barcode}
              onChange={(e) => {
                // Chỉ cho phép nhập số
                const value = e.target.value.replace(/[^0-9]/g, '')
                setBarcode(value)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  xuLyBarcode()
                }
                // Chặn các phím không phải số (trừ các phím điều hướng và chức năng)
                if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)) {
                  e.preventDefault()
                }
              }}
            />
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Gợi ý: máy quét thường nhập rất nhanh như bàn phím; hệ thống sẽ tự xử lý sau khi dừng nhập một chút.
              Bạn cũng có thể nhấn Enter để xử lý ngay.
            </p>
          </div>
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
          
          {/* Giảm giá và Thuế - chỉ hiển thị khi là khách hàng thân thiết */}
          {customerType === 'vip' && (
            <>
              <div className="flex justify-between items-center py-2">
                <div className="flex items-center">
                  <span className="text-gray-600 dark:text-gray-400 mr-2">Giảm giá:</span>
                  <NhapLieu
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
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
                    value={tax}
                    onChange={(e) => setTax(Number(e.target.value))}
                    className="w-32 py-1"
                    min={0}
                    max={100}
                  />
                </div>
                <span className="font-medium">{formatCurrency(calculatedTax)}</span>
              </div>
            </>
          )}
          
          <div className="flex justify-between items-center py-2 text-lg font-bold">
            <span>Tổng thanh toán:</span>
            <span className="text-primary-600 dark:text-primary-400">{formatCurrency(finalAmount)}</span>
          </div>

          {/* Checkbox ghi nợ - chỉ hiển thị cho khách hàng thân thiết */}
          {customerType === 'vip' && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDebt}
                  onChange={(e) => setIsDebt(e.target.checked)}
                  className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500 dark:border-gray-600 dark:focus:ring-primary-400"
                />
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">
                    Mua thiếu (ghi nợ)
                  </span>
                  {isDebt && (
                    <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                      ⚠️ Đơn hàng này chưa được tính vào doanh thu
                    </p>
                  )}
                </div>
              </label>
            </div>
          )}
        </div>
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

    
    </form>
  )
}
