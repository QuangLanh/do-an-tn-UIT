/**
 * 404 Not Found Page
 * Trang hiển thị khi không tìm thấy route
 */

import { useNavigate } from 'react-router-dom'
import { NutBam } from '@/giao-dien/components/NutBam'
import { Home, ArrowLeft } from 'lucide-react'

export const TrangKhongTimThay = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-primary-600 dark:text-primary-400">404</h1>
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mt-4">
          Không tìm thấy trang
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-4 max-w-md">
          Trang bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
        </p>
        <div className="flex justify-center space-x-4 mt-8">
          <NutBam variant="secondary" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} className="mr-2" />
            Quay lại
          </NutBam>
          <NutBam onClick={() => navigate('/dashboard')}>
            <Home size={20} className="mr-2" />
            Về trang chủ
          </NutBam>
        </div>
      </div>
    </div>
  )
}

