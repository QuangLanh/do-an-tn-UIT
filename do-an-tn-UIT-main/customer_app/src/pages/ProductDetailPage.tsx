import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ShoppingCart, Minus, Plus } from 'lucide-react'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { Spinner } from '@/components/Spinner'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { productApi } from '@/api/productApi'
import { Product } from '@/types'
import { formatCurrency } from '@/utils/formatters'
import { useCartStore } from '@/store/cartStore'
import toast from 'react-hot-toast'

export const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addToCart } = useCartStore()
  
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    if (id) {
      loadProduct(id)
    }
  }, [id])

  const loadProduct = async (productId: string) => {
    try {
      setIsLoading(true)
      const data = await productApi.getProductById(productId)
      setProduct(data)
    } catch (error) {
      toast.error('Không thể tải thông tin sản phẩm')
      navigate('/')
    } finally {
      setIsLoading(false)
    }
  }

  const getImageUrl = (url?: string) => {
    if (!url) return ''
    if (url.startsWith('http')) return url
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000'
    const cleanUrl = url.startsWith('/') ? url : `/${url}`
    return `${apiUrl}${cleanUrl}`
  }

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Spinner size="lg" />
        </div>
        <Footer />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-600 dark:text-gray-400">Không tìm thấy sản phẩm</p>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header />
      <div className="flex-1 py-8">
        <div className="max-w-6xl mx-auto px-4">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft size={16} className="mr-2" />
          Quay lại
        </Button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Image */}
          <Card>
            <div className="w-full h-96 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
              {product.imageUrl ? (
                <img
                  src={getImageUrl(product.imageUrl)}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/400?text=No+Image'
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No Image
                </div>
              )}
            </div>
          </Card>

          {/* Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
                {product.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">{product.category}</p>
            </div>

            <div className="flex items-baseline gap-4">
              <span className="text-4xl font-bold text-primary-600 dark:text-primary-400">
                {formatCurrency(product.salePrice)}
              </span>
              <span className="text-gray-500">/ {product.unit}</span>
            </div>

            {product.description && (
              <Card className="bg-gray-50 dark:bg-gray-800">
                <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Mô tả</h3>
                <div 
                  className="text-gray-600 dark:text-gray-400 product-description"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </Card>
            )}

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-gray-700 dark:text-gray-300">Số lượng:</span>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus size={16} />
                  </Button>
                  <span className="w-12 text-center font-semibold">{quantity}</span>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus size={16} />
                  </Button>
                </div>
              </div>

              <div className="text-xl font-semibold text-gray-900 dark:text-white">
                Tổng: {formatCurrency(product.salePrice * quantity)}
              </div>

              <div className="flex gap-3">
                <Button
                  size="lg"
                  className="flex-1"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart size={20} className="mr-2" />
                  Thêm vào giỏ hàng
                </Button>
                <Button
                  size="lg"
                  variant="success"
                  onClick={() => {
                    handleAddToCart()
                    navigate('/cart')
                  }}
                >
                  Mua ngay
                </Button>
              </div>
            </div>

            {product.stock !== undefined && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Còn lại: {product.stock} {product.unit}
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
