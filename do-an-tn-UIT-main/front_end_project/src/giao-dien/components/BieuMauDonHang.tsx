/**
 * Order Form Component
 * Component form tạo và chỉnh sửa đơn hàng
 * ĐÃ NÂNG CẤP: Gợi ý khách hàng thân thiết & Tự điền SĐT
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

// Interface lưu thông tin khách quen
interface KnownCustomer {
  name: string;
  phone: string;
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
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)
  
  // Barcode states
  const [barcode, setBarcode] = useState('')
  const [barcodeQuantity, setBarcodeQuantity] = useState(1)
  const barcodeInputRef = useRef<HTMLInputElement | null>(null)
  const barcodeDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastProcessedBarcodeRef = useRef<string | null>(null)
  const isProcessingBarcodeRef = useRef(false)

  // --- LOGIC MỚI: QUẢN LÝ KHÁCH HÀNG THÂN THIẾT ---
  const [knownCustomers, setKnownCustomers] = useState<KnownCustomer[]>([])

  // 1. Tải lịch sử khách hàng khi mở form
  useEffect(() => {
    const loadCustomerHistory = async () => {
      try {
        // Lấy tất cả đơn hàng cũ để lọc ra danh sách khách
        // (Lưu ý: Về lâu dài nên có API riêng /api/customers để tối ưu tốc độ)
        const allOrders = await orderApi.getAllOrders.execute()
        
        const uniqueMap = new Map<string, string>();
        
        allOrders.forEach(order => {
          // Chỉ lấy khách có tên, có sđt và không phải khách lẻ
          if (order.customerName && order.customerPhone && order.customerName.toLowerCase() !== 'khách lẻ') {
            // Lưu vào Map để loại bỏ trùng lặp (Key là tên, Value là SĐT mới nhất)
            uniqueMap.set(order.customerName.toLowerCase(), order.customerPhone);
            // Lưu cả tên gốc để hiển thị cho đẹp
            uniqueMap.set(order.customerName, order.customerPhone);
          }
        });

        const customers: KnownCustomer[] = [];
        uniqueMap.forEach((phone, name) => {
           // Chỉ lấy những key không phải lowercase để hiển thị
           if (name.charAt(0) === name.charAt(0).toUpperCase() || /[A-Z]/.test(name)) {
              customers.push({ name, phone });
           } else if (!uniqueMap.has(name.replace(/\b\w/g, l => l.toUpperCase()))) {
              // Fallback cho tên viết thường toàn bộ
              customers.push({ name: name, phone });
           }
        });

        // Lọc trùng lặp lần cuối cho chắc chắn
        const uniqueCustomers = Array.from(new Set(customers.map(c => JSON.stringify(c))))
            .map(s => JSON.parse(s) as KnownCustomer)
            .sort((a, b) => a.name.localeCompare(b.name));

        setKnownCustomers(uniqueCustomers);
      } catch (error) {
        console.error('Lỗi tải lịch sử khách hàng', error);
      }
    }
    loadCustomerHistory();
  }, []);

  // 2. Hàm xử lý khi nhập tên -> Tự động điền SĐT
  const handleCustomerNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomerName(val);

    // Tìm chính xác tên trong danh sách (không phân biệt hoa thường)
    const match = knownCustomers.find(c => c.name.toLowerCase() === val.toLowerCase());
    if (match) {
      setCustomerPhone(match.phone);
      // Optional: Toast báo đã tìm thấy
      // toast.success(`Đã tìm thấy khách: ${match.name}`);
    }
  };
  // --------------------------------------------------

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
    setCurrentPage(1)
  }, [searchQuery, products])

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredProducts.slice(startIndex, endIndex)
  }, [filteredProducts, currentPage, itemsPerPage])

  const addProductToOrder = (product: Product, qty: number) => {
    const quantityToAdd = Math.max(1, Math.floor(Number(qty || 1)))

    if (product.stock <= 0) {
      toast.error(`Sản phẩm ${product.name} đã hết hàng`)
      return
    }

    if (quantityToAdd > product.stock) {
      toast.error(`Chỉ còn ${product.stock} ${product.unit} trong kho`)
      return
    }

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
      barcodeInputRef.current?.focus()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể xử lý barcode'
      toast.error(message)
    } finally {
      isProcessingBarcodeRef.current = false
      setTimeout(() => {
        if (lastProcessedBarcodeRef.current === code) {
          lastProcessedBarcodeRef.current = null
        }
      }, 300)
    }
  }

  useEffect(() => {
    setBarcode('')
    lastProcessedBarcodeRef.current = null
    if (barcodeDebounceRef.current) {
      clearTimeout(barcodeDebounceRef.current)
      barcodeDebounceRef.current = null
    }
  }, [customerType])

  useEffect(() => {
    if (barcodeDebounceRef.current) {
      clearTimeout(barcodeDebounceRef.current)
      barcodeDebounceRef.current = null
    }

    const code = barcode.trim()
    if (!code) return

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
  }, [barcode])

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    const updatedItems = items.map(item => {
      if (item.id === itemId) {
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
        isDebt: customerType === 'vip' ? isDebt : false,
      }
      
      onSubmit(orderData)
    } catch (error) {
      console.error('Error submitting order:', error)
      toast.error('Có lỗi xảy ra khi lưu đơn hàng')
      setIsSubmitting(false)
    }
  }

  const finalDiscount = customerType === 'retail' ? 0 : discount
  const finalTax = customerType === 'retail' ? 0 : tax
  
  const { subtotal, tax: calculatedTax, finalAmount } = orderApi.service.calculateOrderTotals(
    items,
    finalDiscount,
    finalTax
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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

      {customerType === 'vip' && (
        <TheThongTin title="Thông tin khách hàng">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* --- Ô NHẬP TÊN CÓ GỢI Ý (DATALIST) --- */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tên khách hàng *
                </label>
                <input
                    list="customer-suggestions" // Link tới datalist bên dưới
                    type="text"
                    value={customerName}
                    onChange={handleCustomerNameChange}
                    placeholder="Nhập tên khách hàng..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                />
                {/* Danh sách gợi ý từ lịch sử */}
                <datalist id="customer-suggestions">
                    {knownCustomers.map((c, index) => (
                        <option key={index} value={c.name}>
                             {/* Hiển thị thêm SĐT trong gợi ý để dễ chọn */}
                             {c.name} - {c.phone} 
                        </option>
                    ))}
                </datalist>
            </div>
            {/* -------------------------------------- */}

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

      {/* ... Phần Barcode và Bảng sản phẩm giữ nguyên như cũ ... */}
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
                const value = e.target.value.replace(/[^0-9]/g, '')
                setBarcode(value)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  xuLyBarcode()
                }
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

        <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-600 dark:text-gray-400">Tổng tiền hàng:</span>
            <span className="font-medium">{formatCurrency(subtotal)}</span>
          </div>
          
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
                      ⚠️ Đơn hàng này chưa được tính vào doanh thu thực tế
                    </p>
                  )}
                </div>
              </label>
            </div>
          )}
        </div>
      </TheThongTin>

      <TheThongTin title="Ghi chú">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="input-field min-h-[100px]"
          placeholder="Nhập ghi chú cho đơn hàng (nếu có)..."
        />
      </TheThongTin>

      <div className="flex justify-end space-x-4">
        <NutBam type="button" variant="secondary" onClick={onCancel}>
          Hủy
        </NutBam>
        <NutBam type="submit" isLoading={isSubmitting}>
          {existingOrder ? 'Cập nhật đơn hàng' : 'Tạo đơn hàng'}
        </NutBam>
      </div>

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