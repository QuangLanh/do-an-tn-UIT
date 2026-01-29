import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Card } from '@/components/Card'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

export const LoginPage = () => {
  const navigate = useNavigate()
  const { requestOTP, loginWithOTP, isLoading } = useAuthStore()
  
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [otpSent, setOtpSent] = useState(false)

  const validatePhone = (phoneNumber: string): boolean => {
    return /^0\d{9}$/.test(phoneNumber)
  }

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone) {
      toast.error('Vui lòng nhập số điện thoại')
      return
    }
    if (!validatePhone(phone)) {
      toast.error('Số điện thoại phải có đúng 10 số và bắt đầu bằng 0')
      return
    }
    try {
      await requestOTP(phone)
      setOtpSent(true)
      setStep('otp')
    } catch (error) {
      // Error handled in store
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otp || otp.length !== 6) {
      toast.error('Vui lòng nhập mã OTP (6 số)')
      return
    }
    try {
      await loginWithOTP(phone, otp, name || undefined)
      navigate('/')
    } catch (error) {
      // Error handled in store
    }
  }

  const handleBackToPhone = () => {
    setStep('phone')
    setOtp('')
    setOtpSent(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-900 dark:text-white">
          Đăng nhập
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
          Chào mừng bạn đến cửa hàng tạp hóa
        </p>

        {step === 'phone' ? (
          <form onSubmit={handleRequestOTP} className="space-y-4">
            <Input
              label="Số điện thoại *"
              type="tel"
              value={phone}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '')
                if (value.length <= 10) {
                  setPhone(value)
                }
              }}
              placeholder="Nhập số điện thoại (ví dụ: 0901234567)"
              required
              maxLength={10}
            />
            
            <Input
              label="Tên (không bắt buộc)"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên của bạn"
            />

            <Button 
              type="submit" 
              isLoading={isLoading}
              className="w-full"
              disabled={!phone || !validatePhone(phone)}
            >
              Gửi mã OTP
            </Button>

            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              <p>Chưa có tài khoản? Hệ thống sẽ tự động tạo tài khoản cho bạn khi đăng nhập lần đầu.</p>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Mã OTP đã được gửi đến số điện thoại
              </p>
              <p className="font-semibold text-gray-900 dark:text-white mt-1">
                {phone}
              </p>
            </div>

            <Input
              label="Mã OTP *"
              type="text"
              value={otp}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '')
                if (value.length <= 6) {
                  setOtp(value)
                }
              }}
              placeholder="Nhập mã OTP (6 số)"
              required
              maxLength={6}
              autoFocus
            />

            <Button 
              type="submit" 
              isLoading={isLoading}
              className="w-full"
              disabled={!otp || otp.length !== 6}
            >
              Xác thực và đăng nhập
            </Button>

            <Button 
              type="button"
              variant="secondary"
              onClick={handleBackToPhone}
              className="w-full"
            >
              Quay lại
            </Button>

            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              <p>Mã OTP có hiệu lực trong 5 phút</p>
            </div>
          </form>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
          >
            Tiếp tục mua sắm không cần đăng nhập →
          </button>
        </div>
      </Card>
    </div>
  )
}
