// src/giao-dien/components/HopThoaiTraHang.tsx
import { useState, useMemo } from 'react'
import { NutBam } from './NutBam'
import { NhapLieu } from './NhapLieu'
import { HopThoai } from './HopThoai'
import { Order } from '@/linh-vuc/orders/entities/Order'
import { formatCurrency } from '@/ha-tang/utils/formatters'
import toast from 'react-hot-toast'

interface HopThoaiTraHangProps {
  isOpen: boolean
  onClose: () => void
  order: Order | null
  onSubmit: (data: any) => void
}

export const HopThoaiTraHang = ({ isOpen, onClose, order, onSubmit }: HopThoaiTraHangProps) => {
  const [returnQuantities, setReturnQuantities] = useState<Record<string, number>>({})
  const [returnReason, setReturnReason] = useState('')
  const [isRestocked, setIsRestocked] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Tính tổng tiền hoàn lại
  const refundTotal = useMemo(() => {
    if (!order) return 0
    let total = 0
    order.items.forEach(item => {
      // SỬA 1: Lấy ID an toàn (dù product là string hay object)
      const productId = typeof item.product === 'string' ? item.product : item.product.id
      const qty = returnQuantities[productId] || 0
      
      // SỬA 2: Dùng unitPrice thay vì price để khớp với Interface của bạn
      // Nếu unitPrice không có thì fallback về 0
      const price = item.unitPrice || 0
      total += qty * price
    })
    return total
  }, [order, returnQuantities])

  if (!order) return null

  const handleQuantityChange = (productId: string, qty: number, max: number) => {
    const validQty = Math.max(0, Math.min(qty, max))
    setReturnQuantities(prev => ({
      ...prev,
      [productId]: validQty
    }))
  }

  const handleSubmit = async () => {
    const returnItems = Object.entries(returnQuantities)
      .filter(([_, qty]) => qty > 0)
      .map(([productId, quantity]) => ({
        productId,
        quantity
      }))

    if (returnItems.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 sản phẩm để trả')
      return
    }

    if (!returnReason) {
      toast.error('Vui lòng nhập lý do trả hàng')
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit({
        originalOrderCode: order.orderNumber,
        returnItems,
        returnReason,
        isRestocked,
        notes: `Trả hàng: ${returnReason}`
      })
      onClose()
      setReturnQuantities({})
      setReturnReason('')
    } catch (error) {
       console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <HopThoai isOpen={isOpen} onClose={onClose} title={`Trả hàng đơn: ${order.orderNumber}`}>
      <div className="space-y-4">
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
              <tr>
                <th className="p-3">Sản phẩm</th>
                <th className="p-3 text-right">Giá mua</th>
                <th className="p-3 text-center">Đã mua</th>
                <th className="p-3 text-center w-24">Số lượng trả</th>
                <th className="p-3 text-right">Thành tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              {order.items.map((item) => {
                // SỬA 3: Xử lý hiển thị tên và giá an toàn
                const productId = typeof item.product === 'string' ? item.product : item.product.id
                // Dùng optional chaining để tránh lỗi nếu product bị null
                const productName = typeof item.product === 'string' ? 'Sản phẩm' : item.product?.name || 'Sản phẩm'
                const price = item.unitPrice || 0
                
                const returnQty = returnQuantities[productId] || 0
                
                return (
                  <tr key={productId} className={returnQty > 0 ? 'bg-red-50 dark:bg-red-900/20' : ''}>
                    <td className="p-3">{productName}</td>
                    <td className="p-3 text-right">{formatCurrency(price)}</td>
                    <td className="p-3 text-center">{item.quantity}</td>
                    <td className="p-3 text-center">
                      <input 
                        type="number"
                        min="0"
                        max={item.quantity}
                        className="w-16 p-1 border rounded text-center dark:bg-gray-800 dark:text-white"
                        value={returnQty}
                        onChange={(e) => handleQuantityChange(productId, Number(e.target.value), item.quantity)}
                      />
                    </td>
                    <td className="p-3 text-right font-medium text-red-600">
                      {returnQty > 0 ? formatCurrency(returnQty * price) : '-'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <span className="font-medium">Tổng tiền hoàn khách:</span>
          <span className="text-xl font-bold text-red-600">{formatCurrency(refundTotal)}</span>
        </div>

        <div className="grid grid-cols-1 gap-4">
            <NhapLieu 
                label="Lý do trả hàng *"
                placeholder="VD: Hàng lỗi, Khách đổi ý..."
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
            />
            
            <label className="flex items-center space-x-2 cursor-pointer p-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-800">
                <input 
                    type="checkbox"
                    checked={isRestocked}
                    onChange={(e) => setIsRestocked(e.target.checked)}
                    className="w-5 h-5 text-primary-600 rounded"
                />
                <div>
                    <span className="font-medium block">Nhập lại vào kho?</span>
                    <span className="text-xs text-gray-500">Bỏ chọn nếu là hàng hỏng/hết hạn (sẽ hủy hàng)</span>
                </div>
            </label>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <NutBam type="button" variant="secondary" onClick={onClose}>Hủy</NutBam>
          <NutBam onClick={handleSubmit} isLoading={isSubmitting} disabled={refundTotal === 0}>
            Xác nhận Hoàn tiền
          </NutBam>
        </div>
      </div>
    </HopThoai>
  )
}