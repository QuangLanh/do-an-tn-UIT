import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Card } from '@/components/Card'
import { Modal } from '@/components/Modal'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import { orderApi } from '@/api/orderApi'
import { formatCurrency } from '@/utils/formatters'
import toast from 'react-hot-toast'

export const CheckoutPage = () => {
  const navigate = useNavigate()
  const { items, getTotalAmount, clearCart } = useCartStore()
  const { user, isAuthenticated } = useAuthStore()

  const [isLoading, setIsLoading] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [orderId, setOrderId] = useState('')

  // Form state
  const [customerInfo, setCustomerInfo] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    email: user?.email || '',
  })
  const [notes, setNotes] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer'>('cash')

  const [errors, setErrors] = useState({
    name: '',
    phone: '',
    address: '',
  })

  const validate = () => {
    const newErrors = {
      name: '',
      phone: '',
      address: '',
    }

    if (!customerInfo.name.trim()) {
      newErrors.name = 'Vui lòng nhập tên'
    }

    if (!customerInfo.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại'
    } else if (!/^[0-9]{10}$/.test(customerInfo.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ'
    }

    if (!customerInfo.address.trim()) {
      newErrors.address = 'Vui lòng nhập địa chỉ'
    }

    setErrors(newErrors)
    return !Object.values(newErrors).some(error => error !== '')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      toast.error('Vui lòng kiểm tra lại thông tin')
      return
    }

    if (items.length === 0) {
      toast.error('Giỏ hàng trống')
      return
    }

    setIsLoading(true)
    try {
      const orderData = {
        customerInfo: {
          name: customerInfo.name,
          phone: customerInfo.phone,
          address: customerInfo.address,
          email: customerInfo.email || undefined,
        },
        items: items.map(item => ({
          productId: item.product.id,
          productName: item.product.name,
          quantity: item.quantity,
          price: item.product.salePrice,
        })),
        notes: notes || undefined,
        paymentMethod,
      }

      const order = await orderApi.createOrder(orderData)
      setOrderId(order.id)
      setShowSuccessModal(true)
      clearCart()
    } catch (error: any) {
      toast.error(error.message || 'Không thể tạo đơn hàng')
    } finally {
      setIsLoading(false)
    }
  }

  if (items.length === 0 && !showSuccessModal) {
    navigate('/cart')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header />
      <div className="flex-1 py-8">
        <div className="max-w-4xl mx-auto px-4">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate('/cart')}
          className="mb-6"
        >
          <ArrowLeft size={16} className="mr-2" />
          Quay lại giỏ hàng
        </Button>

        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
          Thông tin đặt hàng
        </h1>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Order Form */}
          <div className="space-y-6">
            <Card title="Thông tin người nhận">
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Họ và tên *"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                  error={errors.name}
                  placeholder="Nhập họ và tên"
                  disabled={isAuthenticated}
                />

                <Input
                  label="Số điện thoại *"
                  type="tel"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                  error={errors.phone}
                  placeholder="Nhập số điện thoại"
                  disabled={isAuthenticated}
                />

                <Input
                  label="Địa chỉ nhận hàng *"
                  value={customerInfo.address}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                  error={errors.address}
                  placeholder="Nhập địa chỉ chi tiết"
                />

                <Input
                  label="Email (không bắt buộc)"
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                  placeholder="Nhập email"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ghi chú
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ghi chú thêm cho đơn hàng..."
                    className="input-field min-h-[100px]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phương thức thanh toán
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="cash"
                        checked={paymentMethod === 'cash'}
                        onChange={(e) => setPaymentMethod(e.target.value as 'cash')}
                        className="mr-2"
                      />
                      <span>Tiền mặt khi nhận hàng</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="transfer"
                        checked={paymentMethod === 'transfer'}
                        onChange={(e) => setPaymentMethod(e.target.value as 'transfer')}
                        className="mr-2"
                      />
                      <span>Chuyển khoản</span>
                    </label>
                  </div>
                </div>
              </form>
            </Card>

            {!isAuthenticated && (
              <Card className="bg-blue-50 dark:bg-blue-900/20">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  💡 <strong>Mẹo:</strong> Đăng nhập để lưu thông tin và theo dõi đơn hàng dễ dàng hơn
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate('/login')}
                  className="mt-2"
                >
                  Đăng nhập ngay
                </Button>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div>
            <Card title="Chi tiết đơn hàng">
              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.product.id} className="flex justify-between text-sm">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {item.product.name}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        {formatCurrency(item.product.salePrice)} x {item.quantity}
                      </p>
                    </div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(item.product.salePrice * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                <div className="flex justify-between items-center mb-4">
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
                  onClick={handleSubmit}
                  isLoading={isLoading}
                  disabled={isLoading}
                >
                  Đặt hàng
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Success Modal */}
        <Modal
          isOpen={showSuccessModal}
          onClose={() => {
            setShowSuccessModal(false)
            navigate('/')
          }}
          title="Đặt hàng thành công"
        >
          <div className="text-center py-6">
            <CheckCircle size={64} className="mx-auto mb-4 text-green-600" />
            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
              Cảm ơn bạn đã đặt hàng!
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Mã đơn hàng: <strong>{orderId}</strong>
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Chúng tôi sẽ liên hệ với bạn sớm nhất để xác nhận đơn hàng
            </p>
            
            <div className="flex gap-3 justify-center">
              <Button onClick={() => navigate('/orders')}>
                Xem đơn hàng
              </Button>
              <Button variant="secondary" onClick={() => navigate('/')}>
                Tiếp tục mua sắm
              </Button>
            </div>
          </div>
        </Modal>
        </div>
      </div>
      <Footer />
    </div>
  )
}
