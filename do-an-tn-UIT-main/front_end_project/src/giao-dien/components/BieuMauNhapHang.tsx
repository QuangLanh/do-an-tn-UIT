/**
 * Component: BieuMauNhapHang.tsx
 * CHUẨN GIAO DIỆN CŨ + FIX Ô NHẬP SỐ LƯỢNG
 */

import { useState, useEffect, useMemo } from 'react'
import { NutBam } from './NutBam'
import { NhapLieu } from './NhapLieu'
import { TheThongTin } from './TheThongTin'
import { BangDuLieu } from './BangDuLieu'
import { PhanTrang } from './PhanTrang'
import { Product } from '@/linh-vuc/products/entities/Product'
import { PurchaseItem, Purchase } from '@/linh-vuc/purchases/entities/Purchase'
import { PurchaseRecommendation } from '@/linh-vuc/purchases/entities/PurchaseRecommendation'
import { purchaseApi } from '@/ha-tang/api/purchaseApi'
import { formatCurrency } from '@/ha-tang/utils/formatters'
import { Plus, Minus, Trash2, Search } from 'lucide-react'
import toast from 'react-hot-toast'

interface BieuMauNhapHangProps {
  existingPurchase?: Purchase
  products: Product[]
  recommendations?: PurchaseRecommendation | null
  isRecommendationLoading?: boolean
  onSubmit: (purchase: any) => void
  onCancel: () => void
}

export const BieuMauNhapHang = ({
  existingPurchase,
  products,
  recommendations,
  isRecommendationLoading = false,
  onSubmit,
  onCancel,
}: BieuMauNhapHangProps) => {
  const [items, setItems] = useState<PurchaseItem[]>(existingPurchase?.items || [])
  const [notes, setNotes] = useState(existingPurchase?.notes || '')
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
    setCurrentPage(1)
  }, [searchQuery, products])

  // Tính toán dữ liệu phân trang
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredProducts.slice(startIndex, endIndex)
  }, [filteredProducts, currentPage, itemsPerPage])

  const findProductById = (productId: string): Product | undefined =>
    products.find((p: any) => String(p.id || p._id) === String(productId))

  const handleAddItem = (product: Product) => {
    const existingItemIndex = items.findIndex(item => item.productId === product.id)
    
    if (existingItemIndex >= 0) {
      const updatedItems = [...items]
      const item = updatedItems[existingItemIndex]
      
      updatedItems[existingItemIndex] = {
        ...item,
        quantity: item.quantity + 1,
        subtotal: (item.quantity + 1) * item.unitPrice
      }
      setItems(updatedItems)
    } else {
      const newItem = purchaseApi.service.createPurchaseItem(product, 1, product.importPrice)
      setItems([...items, newItem])
    }
    toast.success(`Đã thêm ${product.name}`)
  }

  const handleAddRecommendedItem = (productId: string, suggestedQty: number, suggestedPrice?: number) => {
    const product = findProductById(productId)
    if (!product) {
      toast.error('Không tìm thấy sản phẩm trong danh sách hiện tại')
      return
    }

    const qtyToAdd = Math.max(1, Number(suggestedQty || 0))
    const unitPrice = Number(suggestedPrice || 0) > 0 ? Number(suggestedPrice) : product.importPrice
    const existingItemIndex = items.findIndex(item => item.productId === product.id)

    if (existingItemIndex >= 0) {
      const updatedItems = [...items]
      const item = updatedItems[existingItemIndex]
      const newQty = item.quantity + qtyToAdd
      updatedItems[existingItemIndex] = {
        ...item,
        quantity: newQty,
        subtotal: newQty * item.unitPrice
      }
      setItems(updatedItems)
    } else {
      const newItem = purchaseApi.service.createPurchaseItem(product, qtyToAdd, unitPrice)
      setItems([...items, newItem])
    }

    toast.success(`Đã thêm gợi ý: ${product.name}`)
  }

  // --- 1. XỬ LÝ NHẬP TỪ BÀN PHÍM (CHO PHÉP XÓA TRẮNG) ---
  const handleInputQuantity = (itemId: string, valueStr: string) => {
    if (valueStr === '') {
        const updatedItems = items.map(item =>
            item.id === itemId ? { ...item, quantity: 0, subtotal: 0 } : item
        );
        setItems(updatedItems);
        return;
    }

    let newQty = parseInt(valueStr);
    if (isNaN(newQty)) return;

    // Nếu nhập số âm thì chặn
    if (newQty < 0) newQty = 1;

    const updatedItems = items.map(item => {
        if (item.id === itemId) {
            return {
                ...item,
                quantity: newQty,
                subtotal: newQty * item.unitPrice
            }
        }
        return item;
    });
    setItems(updatedItems);
  };

  // --- 2. XỬ LÝ KHI CLICK RA NGOÀI (BLUR) ---
  const handleBlurQuantity = (itemId: string) => {
      const updatedItems = items.map(item => {
          // Nếu đang rỗng hoặc = 0 thì tự động về 1
          if (item.id === itemId && (item.quantity === 0 || isNaN(item.quantity))) {
              return {
                  ...item,
                  quantity: 1,
                  subtotal: 1 * item.unitPrice
              }
          }
          return item;
      });
      setItems(updatedItems);
  }

  // --- 3. XỬ LÝ NÚT BẤM (GIỮ NGUYÊN) ---
  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) return;
    
    const updatedItems = items.map(item => {
      if (item.id === itemId) {
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

  const handleUpdatePrice = (itemId: string, newPrice: number) => {
    if (newPrice <= 0) {
      toast.error('Giá nhập phải lớn hơn 0')
      return
    }
    
    const updatedItems = items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          unitPrice: newPrice,
          subtotal: item.quantity * newPrice
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
      toast.error('Phiếu nhập phải có ít nhất một sản phẩm')
      return
    }

    // Kiểm tra số lượng hợp lệ
    const invalidItems = items.filter(i => i.quantity <= 0);
    if (invalidItems.length > 0) {
        toast.error('Vui lòng kiểm tra lại số lượng sản phẩm');
        return;
    }
    
    setIsSubmitting(true)
    
    try {
      const totalAmount = purchaseApi.service.calculatePurchaseTotals(items)
      
      const purchaseData = {
        id: existingPurchase?.id,
        items,
        // supplierName: supplierName, // Đã bỏ trường này vì trang cha lo liệu
        notes,
        totalAmount,
        status: existingPurchase?.status || 'completed',
      }
      
      onSubmit(purchaseData)
    } catch (error) {
      console.error('Error submitting purchase:', error)
      toast.error('Có lỗi xảy ra khi lưu phiếu nhập')
      setIsSubmitting(false)
    }
  }

  const totalAmount = purchaseApi.service.calculatePurchaseTotals(items)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <TheThongTin title="Gợi ý nhập hàng">
        <div id="goi-y-nhap-hang-anchor"></div>
        {isRecommendationLoading ? (
          <div className="text-center py-6 text-gray-500 dark:text-gray-400">Đang tải gợi ý...</div>
        ) : !recommendations ? (
          <div className="text-center py-6 text-gray-500 dark:text-gray-400">
            Chưa có dữ liệu gợi ý nhập hàng
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Cập nhật lúc: {new Date(recommendations.generatedAt).toLocaleString('vi-VN')}
            </div>

            {([
              { key: 'highPriority', label: 'Ưu tiên cao', color: 'text-red-600 dark:text-red-400' },
              { key: 'mediumPriority', label: 'Ưu tiên trung bình', color: 'text-amber-600 dark:text-amber-400' },
              { key: 'lowPriority', label: 'Ưu tiên thấp', color: 'text-emerald-600 dark:text-emerald-400' },
            ] as const).map((group) => {
              const list = recommendations[group.key]
              return (
                <div key={group.key} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                  <div className={`font-semibold mb-2 ${group.color}`}>
                    {group.label} ({list.length})
                  </div>
                  {list.length === 0 ? (
                    <div className="text-sm text-gray-500 dark:text-gray-400">Không có sản phẩm</div>
                  ) : (
                    <div className="space-y-2 max-h-56 overflow-y-auto">
                      {list.map((item) => (
                        <div
                          key={`${group.key}-${item.productId}`}
                          className="flex items-start justify-between gap-3 p-2 border border-gray-100 dark:border-gray-800 rounded"
                        >
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white truncate">{item.productName}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Tồn: {item.currentStock} | Gợi ý: {item.recommendedQuantity}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.reason}</p>
                          </div>
                          <NutBam
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() =>
                              handleAddRecommendedItem(
                                item.productId,
                                item.recommendedQuantity,
                                item.suggestedPurchasePrice
                              )
                            }
                          >
                            <Plus size={14} className="mr-1" /> Thêm
                          </NutBam>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </TheThongTin>

      {/* 🟢 ĐÃ XÓA PHẦN "THÔNG TIN NHÀ CUNG CẤP" Ở ĐÂY (VÌ ĐÃ CÓ Ở TRANG CHA) */}

      {/* Danh sách sản phẩm trong phiếu nhập */}
      <TheThongTin title="Sản phẩm nhập hàng">
        {items.length === 0 ? (
          <div className="text-center py-6 text-gray-500 dark:text-gray-400">
            Chưa có sản phẩm nào trong phiếu nhập
          </div>
        ) : (
          <BangDuLieu
            data={items}
            columns={[
              {
                header: 'Sản phẩm',
                accessor: (item: PurchaseItem) => item.product.name,
              },
              {
                header: 'Giá nhập',
                accessor: (item: PurchaseItem) => (
                  <NhapLieu
                    type="number"
                    value={item.unitPrice}
                    onChange={(e) => handleUpdatePrice(item.id, Number(e.target.value))}
                    className="w-24 py-1"
                    min={1}
                  />
                ),
              },
              {
                header: 'Số lượng',
                accessor: (item: PurchaseItem) => (
                  <div className="flex items-center space-x-2">
                    {/* NÚT TRỪ (Hình tròn) */}
                    <button
                      type="button"
                      onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                      className="p-1 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 flex-shrink-0"
                    >
                      <Minus size={16} />
                    </button>

                    {/* 👇 Ô NHẬP LIỆU (Ẩn mũi tên, cho phép xóa) */}
                    <input
                        type="number"
                        className="w-14 text-center border border-gray-300 dark:border-gray-600 rounded py-1 px-1 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500
                                   [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        value={item.quantity === 0 ? '' : item.quantity} // 0 thì hiển thị rỗng
                        onChange={(e) => handleInputQuantity(item.id, e.target.value)}
                        onBlur={() => handleBlurQuantity(item.id)}
                        onFocus={(e) => e.target.select()}
                    />

                    {/* NÚT CỘNG (Hình tròn) */}
                    <button
                      type="button"
                      onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      className="p-1 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 flex-shrink-0"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                ),
              },
              {
                header: 'Thành tiền',
                accessor: (item: PurchaseItem) => formatCurrency(item.subtotal),
              },
              {
                header: 'Thao tác',
                accessor: (item: PurchaseItem) => (
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
          <div className="flex justify-between items-center py-2 text-lg font-bold">
            <span>Tổng tiền nhập hàng:</span>
            <span className="text-primary-600 dark:text-primary-400">{formatCurrency(totalAmount)}</span>
          </div>
        </div>
      </TheThongTin>

      {/* Tìm kiếm sản phẩm (Giao diện cũ: Nút "Thêm" to) */}
      <TheThongTin title="Thêm sản phẩm vào phiếu nhập">
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
                  Giá nhập: {formatCurrency(product.importPrice)} / {product.unit}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Tồn kho: {product.stock} {product.unit}
                </p>
                {/* NÚT THÊM - TO RỘNG (Giữ nguyên) */}
                <NutBam
                  type="button"
                  onClick={() => handleAddItem(product)}
                  size="sm"
                  className="w-full"
                >
                  <Plus size={16} className="mr-1" /> Thêm
                </NutBam>
              </div>
            </div>
          ))}
        </div>
      </TheThongTin>

        {filteredProducts.length > 0 && (
          <div className="mt-4">
            <PhanTrang
              currentPage={currentPage}
              totalItems={filteredProducts.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
              itemsPerPageOptions={[12, 24, 48, 96]}
            />
          </div>
        )}

      {/* Ghi chú */}
      <TheThongTin title="Ghi chú">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="input-field min-h-[100px]"
          placeholder="Nhập ghi chú cho phiếu nhập (nếu có)..."
        />
      </TheThongTin>

      {/* Buttons */}
      <div className="flex justify-end space-x-4">
        <NutBam type="button" variant="secondary" onClick={onCancel}>
          Hủy
        </NutBam>
        <NutBam type="submit" isLoading={isSubmitting}>
          {existingPurchase ? 'Cập nhật phiếu nhập' : 'Tạo phiếu nhập'}
        </NutBam>
      </div>
    </form>
  )
}