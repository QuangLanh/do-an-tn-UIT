import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { NhapLieu } from '@/giao-dien/components/NhapLieu'
import { NutBam } from '@/giao-dien/components/NutBam'
import { useAuthStore } from '@/kho-trang-thai/khoXacThuc'

export const TrangDangNhapKhachHang = () => {
  const navigate = useNavigate()
  const { dangNhapKhachHang, isLoading } = useAuthStore()
  const [soDienThoai, setSoDienThoai] = useState('')
  const [ten, setTen] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      await dangNhapKhachHang({ soDienThoai, ten: ten || undefined })
      toast.success('Đăng nhập thành công!')
      navigate('/khach-hang/san-pham')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Đăng nhập thất bại')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Đăng nhập khách hàng</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Nhập số điện thoại để xem sản phẩm và tạo danh sách mua.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <NhapLieu
            label="Số điện thoại"
            placeholder="Ví dụ: 0901234567"
            value={soDienThoai}
            onChange={(e) => setSoDienThoai(e.target.value)}
            required
          />
          <NhapLieu
            label="Tên (không bắt buộc)"
            placeholder="Ví dụ: Cô Lan"
            value={ten}
            onChange={(e) => setTen(e.target.value)}
          />

          <NutBam type="submit" className="w-full" isLoading={isLoading}>
            Đăng nhập
          </NutBam>
        </form>
      </div>
    </div>
  )
}


