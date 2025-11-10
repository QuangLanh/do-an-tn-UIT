/**
 * Purchase Form Component
 * Component form tạo và chỉnh sửa phiếu nhập hàng
 */

import { useState, useEffect } from 'react'
import { Button } from './Button'
import { Input } from './Input'
import { Card } from './Card'
import { Table } from './Table'
import { Product } from '@/domains/products/entities/Product'
import { PurchaseItem, Purchase } from '@/domains/purchases/entities/Purchase'
import { purchaseApi } from '@/infra/api/purchaseApi'
import { formatCurrency } from '@/infra/utils/formatters'
import { Plus, Minus, Trash2, Search } from 'lucide-react'
import toast from 'react-hot-toast'

interface PurchaseFormProps {
  existingPurchase?: Purchase
  products: Product[]
  onSubmit: (purchase: any) => void
  onCancel: () => void
}

export const PurchaseForm = ({ existingPurchase, products, onSubmit, onCancel }: PurchaseFormProps) => {
  const [items, setItems] = useState<PurchaseItem[]>(existingPurchase?.items || [])
  const [supplierName, setSupplierName] = useState(existingPurchase?.supplierName || '')
  const [notes, setNotes] = useState(existingPurchase?.notes || '')
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products)
  const [isSubmitting, setIsSubmitting] = useState(false)

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
  }, [searchQuery, products])

  const handleAddItem = (product: Product) => {
    // Kiểm tra nếu sản phẩm đã có trong phiếu nhập
    const existingItemIndex = items.findIndex(item => item.productId === product.id)
    
    if (existingItemIndex >= 0) {
      // Tăng số lượng nếu sản phẩm đã có
      const updatedItems = [...items]
      const item = updatedItems[existingItemIndex]
      
      updatedItems[existingItemIndex] = {
        ...item,
        quantity: item.quantity + 1,
        subtotal: (item.quantity + 1) * item.unitPrice
      }
      setItems(updatedItems)
    } else {
      // Thêm sản phẩm mới vào phiếu nhập
      const newItem = purchaseApi.service.createPurchaseItem(product, 1, product.importPrice)
      setItems([...items, newItem])
    }
  }

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      toast.error('Số lượng phải lớn hơn 0')
      return
    }
    
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
    
    if (!supplierName) {
      toast.error('Vui lòng nhập tên nhà cung cấp')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Tính tổng tiền
      const totalAmount = purchaseApi.service.calculatePurchaseTotals(items)
      
      const purchaseData = {
        id: existingPurchase?.id,
        items,
        supplierName,
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

  // Tính tổng tiền phiếu nhập
  const totalAmount = purchaseApi.service.calculatePurchaseTotals(items)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Thông tin nhà cung cấp */}
      <Card title="Thông tin nhà cung cấp">
        <Input
          label="Tên nhà cung cấp"
          value={supplierName}
          onChange={(e) => setSupplierName(e.target.value)}
          placeholder="Nhập tên nhà cung cấp"
          required
        />
      </Card>

      {/* Danh sách sản phẩm trong phiếu nhập */}
      <Card title="Sản phẩm nhập hàng">
        {items.length === 0 ? (
          <div className="text-center py-6 text-gray-500 dark:text-gray-400">
            Chưa có sản phẩm nào trong phiếu nhập
          </div>
        ) : (
          <Table
            data={items}
            columns={[
              {
                header: 'Sản phẩm',
                accessor: (item: PurchaseItem) => item.product.name,
              },
              {
                header: 'Giá nhập',
                accessor: (item: PurchaseItem) => (
                  <Input
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
      </Card>

      {/* Tìm kiếm sản phẩm để thêm vào phiếu nhập */}
      <Card title="Thêm sản phẩm vào phiếu nhập">
        <div className="mb-4 relative">
          <Search
            size={20}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <Input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <div>
                <h4 className="font-medium">{product.name}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Giá nhập hiện tại: {formatCurrency(product.importPrice)} / {product.unit}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Tồn kho: {product.stock} {product.unit}
                </p>
              </div>
              <Button
                type="button"
                onClick={() => handleAddItem(product)}
                size="sm"
              >
                <Plus size={16} className="mr-1" /> Thêm
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Ghi chú */}
      <Card title="Ghi chú">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="input-field min-h-[100px]"
          placeholder="Nhập ghi chú cho phiếu nhập (nếu có)..."
        />
      </Card>

      {/* Buttons */}
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {existingPurchase ? 'Cập nhật phiếu nhập' : 'Tạo phiếu nhập'}
        </Button>
      </div>
    </form>
  )
}
