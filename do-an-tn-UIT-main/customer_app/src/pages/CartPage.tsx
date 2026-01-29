import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { useCartStore } from '@/store/cartStore'
import { formatCurrency } from '@/utils/formatters'

export const CartPage = () => {
  const navigate = useNavigate()
  const { items, updateQuantity, removeFromCart, clearCart, getTotalAmount } = useCartStore()

  const getImageUrl = (url?: string) => {
    if (!url) return ''
    if (url.startsWith('http')) return url
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000'
    const cleanUrl = url.startsWith('/') ? url : `/${url}`
    return `${apiUrl}${cleanUrl}`
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center px-4">
          <Card className="text-center max-w-md">
            <ShoppingBag size={64} className="mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
              Giỏ hàng trống
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Bạn chưa có sản phẩm nào trong giỏ hàng
            </p>
            <Button onClick={() => navigate('/')}>
              Tiếp tục mua sắm
            </Button>
          </Card>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header />
      <div className="flex-1 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/')}
          >
            <ArrowLeft size={16} className="mr-2" />
            Tiếp tục mua sắm
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={clearCart}
          >
            <Trash2 size={16} className="mr-2" />
            Xóa toàn bộ
          </Button>
        </div>

        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
          Giỏ hàng của bạn
        </h1>

        <div className="space-y-4 mb-6">
          {items.map((item) => (
            <Card key={item.product.id}>
              <div className="flex gap-4">
                {/* Image */}
                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                  {item.product.imageUrl ? (
                    <img
                      src={getImageUrl(item.product.imageUrl)}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/100?text=No+Image'
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                      No Image
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1 text-gray-900 dark:text-white">
                    {item.product.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {item.product.category}
                  </p>
                  <p className="text-primary-600 dark:text-primary-400 font-semibold">
                    {formatCurrency(item.product.salePrice)} / {item.product.unit}
                  </p>
                </div>

                {/* Quantity & Actions */}
                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-red-600 hover:text-red-700 dark:text-red-400"
                  >
                    <Trash2 size={18} />
                  </button>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    >
                      <Minus size={14} />
                    </Button>
                    <span className="w-12 text-center font-semibold">
                      {item.quantity}
                    </span>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    >
                      <Plus size={14} />
                    </Button>
                  </div>

                  <p className="font-bold text-lg text-gray-900 dark:text-white">
                    {formatCurrency(item.product.salePrice * item.quantity)}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Summary */}
        <Card className="sticky bottom-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xl font-semibold text-gray-900 dark:text-white">
              Tổng cộng:
            </span>
            <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {formatCurrency(getTotalAmount())}
            </span>
          </div>

          <Button
            size="lg"
            className="w-full"
            onClick={() => navigate('/checkout')}
          >
            Tiến hành đặt hàng
          </Button>
        </Card>
      </div>
      </div>
      <Footer />
    </div>
  )
}
