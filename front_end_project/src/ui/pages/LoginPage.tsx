/**
 * Login Page
 * Trang đăng nhập với fake authentication
 */

import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/ui/components/Button'
import { Input } from '@/ui/components/Input'
import toast from 'react-hot-toast'
import { ShoppingBag } from 'lucide-react'

export const LoginPage = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const { login, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    try {
      await login({ username, password })
      toast.success('Đăng nhập thành công!')
      navigate('/dashboard')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Đăng nhập thất bại')
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
            <Input
              label="Tên đăng nhập"
              type="text"
              placeholder="Nhập tên đăng nhập"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <Input
              label="Mật khẩu"
              type="password"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Đăng nhập
            </Button>
          </form>

          {/* Demo Accounts Info */}
          <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Tài khoản demo:
            </p>
            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <p>👨‍💼 Admin: admin@taphoa.com / admin123</p>
              <p>👨‍💻 Nhân viên: staff@taphoa.com / staff123</p>
              <p>👨‍💼 Quản lý: manager@taphoa.com / manager123</p>
              <p>👨‍💼 Kế toán: accountant@taphoa.com / accountant123</p>
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

