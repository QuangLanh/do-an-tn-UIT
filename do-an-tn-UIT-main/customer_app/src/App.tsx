import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ProductListPage } from '@/pages/ProductListPage'
import { ProductDetailPage } from '@/pages/ProductDetailPage'
import { CartPage } from '@/pages/CartPage'
import { CheckoutPage } from '@/pages/CheckoutPage'
import { OrdersPage } from '@/pages/OrdersPage'
import { OrderDetailPage } from '@/pages/OrderDetailPage'
import { LoginPage } from '@/pages/LoginPage'
import { useAuthStore } from '@/store/authStore'
import { khoiTaoMaCuaHang, layTienToDuongDan } from '@/api/storeContext'
import { storeApi, ThongTinCuaHang } from '@/api/storeApi'
import { Spinner } from '@/components/Spinner'

/** Trang báo lỗi khi đường dẫn không chỉ tới cửa hàng nào. */
const KhongTimThayCuaHang = ({ ma }: { ma: string }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div className="max-w-md text-center">
      <h1 className="text-2xl font-semibold text-gray-900">
        {ma ? 'Không tìm thấy cửa hàng' : 'Thiếu địa chỉ cửa hàng'}
      </h1>
      <p className="mt-3 text-gray-600">
        {ma ? (
          <>
            Cửa hàng <span className="font-medium">&ldquo;{ma}&rdquo;</span> không tồn tại
            hoặc đã ngừng hoạt động.
          </>
        ) : (
          'Hãy truy cập theo đường dẫn của cửa hàng, ví dụ /s/tap-hoa-minh-anh.'
        )}
      </p>
    </div>
  </div>
)

function App() {
  const { verifyToken, token } = useAuthStore()
  const [maCuaHang] = useState(() => khoiTaoMaCuaHang())
  const [cuaHang, setCuaHang] = useState<ThongTinCuaHang | null>(null)
  const [dangTai, setDangTai] = useState(true)

  // Xác nhận cửa hàng có thật trước khi cho vào ứng dụng — tránh việc mọi API
  // phía sau đều lỗi vì mã cửa hàng sai.
  useEffect(() => {
    if (!maCuaHang) {
      setDangTai(false)
      return
    }

    storeApi
      .layThongTinCongKhai(maCuaHang)
      .then(setCuaHang)
      .catch(() => setCuaHang(null))
      .finally(() => setDangTai(false))
  }, [maCuaHang])

  useEffect(() => {
    if (token) {
      verifyToken()
    }
  }, []) // Only run once on mount

  if (dangTai) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (!cuaHang) {
    return <KhongTimThayCuaHang ma={maCuaHang} />
  }

  return (
    <BrowserRouter basename={layTienToDuongDan()}>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
          },
        }}
      />

      <Routes>
        <Route path="/" element={<ProductListPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/orders/:id" element={<OrderDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
