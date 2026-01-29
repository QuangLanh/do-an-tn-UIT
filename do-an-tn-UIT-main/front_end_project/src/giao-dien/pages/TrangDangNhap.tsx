/**
 * Login Page
 * Trang đăng nhập với fake authentication
 */

import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/kho-trang-thai/khoXacThuc'
import { NutBam } from '@/giao-dien/components/NutBam'
import { NhapLieu } from '@/giao-dien/components/NhapLieu'
import toast from 'react-hot-toast'
import { ShoppingBag } from 'lucide-react'

/**
 * Map API/network errors to clear Vietnamese messages for the login form.
 */
function getLoginErrorMessage(error: any): string {
  const msg =
    (typeof error?.response?.data?.message === 'string'
      ? error.response.data.message
      : Array.isArray(error?.response?.data?.message)
        ? error.response.data.message[0]
        : null) || error?.message || ''

  if (
    msg.includes('khóa') ||
    msg.includes('bị khóa') ||
    msg.toLowerCase().includes('inactive') ||
    msg.includes('Account is inactive')
  ) {
    return 'Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.'
  }
  if (
    msg.includes('Sai tên đăng nhập') ||
    msg.includes('mật khẩu') ||
    msg.includes('kiểm tra lại') ||
    msg.toLowerCase().includes('invalid credentials')
  ) {
    return 'Sai tên đăng nhập hoặc mật khẩu. Vui lòng kiểm tra lại.'
  }
  if (
    msg.includes('không tồn tại') ||
    msg.includes('not found') ||
    msg.includes('User not found')
  ) {
    return 'Tài khoản không tồn tại.'
  }
  if (msg.includes('401') || msg === 'Request failed with status code 401') {
    return 'Sai tên đăng nhập hoặc mật khẩu. Vui lòng kiểm tra lại.'
  }
  if (
    msg.includes('500') ||
    msg.includes('ECONNREFUSED') ||
    msg.includes('timeout') ||
    msg.includes('Không thể kết nối') ||
    msg.includes('Network Error')
  ) {
    return 'Lỗi hệ thống. Vui lòng thử lại sau.'
  }
  if (msg) return msg
  return 'Lỗi hệ thống. Vui lòng thử lại sau.'
}

export const TrangDangNhap = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState<string | null>(null)
  const { login, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoginError(null)

    try {
      await login({ username, password })
      toast.success('Đăng nhập thành công!')
      navigate('/dashboard')
    } catch (error: any) {
      const text = getLoginErrorMessage(error)
      setLoginError(text)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="p-4 bg-primary-100 dark:bg-primary-900 rounded-full">
              <ShoppingBag size={48} className="text-primary-600 dark:text-primary-400" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">
            Quản Lý Tạp Hóa
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
            Đăng nhập vào hệ thống
          </p>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <NhapLieu
              label="Tên đăng nhập"
              type="text"
              placeholder="Nhập tên đăng nhập"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value)
                if (loginError) setLoginError(null)
              }}
              required
            />

            <NhapLieu
              label="Mật khẩu"
              type="password"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (loginError) setLoginError(null)
              }}
              required
            />

            <NutBam type="submit" className="w-full" isLoading={isLoading}>
              Đăng nhập
            </NutBam>

            {loginError && (
              <p className="text-sm text-red-600 dark:text-red-400 text-center mt-2" role="alert">
                {loginError}
              </p>
            )}
          </form>

          {/* Demo Accounts Info */}
          <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Tài khoản demo:
            </p>
            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <p>👨‍💼 Admin: admin@taphoa.com / admin123</p>
              <p>👨‍💻 Nhân viên: staff@taphoa.com / staff123</p>
              {/* Đã loại bỏ role Quản lý/Kế toán theo yêu cầu */}
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                💡 Bạn cũng có thể nhập: admin / admin123 (tự động chuyển thành email)
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-white dark:text-gray-300 text-sm mt-6">
          © 2024 Grocery Store Management System
        </p>
      </div>
    </div>
  )
}

