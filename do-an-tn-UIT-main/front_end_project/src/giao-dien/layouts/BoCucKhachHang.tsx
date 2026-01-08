import { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/kho-trang-thai/khoXacThuc'
import { NutBam } from '@/giao-dien/components/NutBam'

interface BoCucKhachHangProps {
  children: ReactNode
}

export const BoCucKhachHang = ({ children }: BoCucKhachHangProps) => {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">Khách hàng</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {user?.fullName || user?.soDienThoai || ''}
            </p>
          </div>
          <div className="flex gap-2">
            <NutBam variant="secondary" onClick={() => navigate('/khach-hang/san-pham')}>
              Sản phẩm
            </NutBam>
            <NutBam variant="secondary" onClick={() => navigate('/khach-hang/danh-sach-mua')}>
              Danh sách mua
            </NutBam>
            <NutBam variant="secondary" onClick={() => navigate('/khach-hang/lich-su-mua')}>
              Lịch sử mua
            </NutBam>
            <NutBam
              variant="danger"
              onClick={() => {
                logout()
                navigate('/khach-hang/dang-nhap')
              }}
            >
              Đăng xuất
            </NutBam>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
    </div>
  )
}


