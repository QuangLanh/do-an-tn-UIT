/**
 * App Router
 * Cấu hình routing cho ứng dụng
 */

import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/kho-trang-thai/khoXacThuc'
import { BoCucChinh } from '@/giao-dien/layouts/BoCucChinh'
import { TuyenBaoVe } from './TuyenBaoVe'

// Pages
import { TrangDangNhap } from '@/giao-dien/pages/TrangDangNhap'
import { TrangBangDieuKhien } from '@/giao-dien/pages/TrangBangDieuKhien'
import { TrangSanPham } from '@/giao-dien/pages/TrangSanPham'
import { TrangKiemKe } from '@/giao-dien/pages/TrangKiemKe'
import { TrangBaoCao } from '@/giao-dien/pages/TrangBaoCao'
import { TrangDonHang } from '@/giao-dien/pages/TrangDonHang'
import { TrangTaoDonHang } from '@/giao-dien/pages/TrangTaoDonHang'
import { TrangNhapHang } from '@/giao-dien/pages/TrangNhapHang'
import { TrangTaoNhapHang } from '@/giao-dien/pages/TrangTaoNhapHang'
import { TrangKhongTimThay } from '@/giao-dien/pages/TrangKhongTimThay'

const UngDungDinhTuyen = () => {
  const { isAuthenticated } = useAuthStore()

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <TrangDangNhap />}
      />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <TuyenBaoVe>
            <BoCucChinh>
              <TrangBangDieuKhien />
            </BoCucChinh>
          </TuyenBaoVe>
        }
      />

      <Route
        path="/products"
        element={
          <TuyenBaoVe>
            <BoCucChinh>
              <TrangSanPham />
            </BoCucChinh>
          </TuyenBaoVe>
        }
      />

      <Route
        path="/inventory"
        element={
          <TuyenBaoVe>
            <BoCucChinh>
              <TrangKiemKe />
            </BoCucChinh>
          </TuyenBaoVe>
        }
      />

      <Route
        path="/orders"
        element={
          <TuyenBaoVe>
            <BoCucChinh>
              <TrangDonHang />
            </BoCucChinh>
          </TuyenBaoVe>
        }
      />

      <Route
        path="/orders/new"
        element={
          <TuyenBaoVe>
            <BoCucChinh>
              <TrangTaoDonHang />
            </BoCucChinh>
          </TuyenBaoVe>
        }
      />

      <Route
        path="/orders/:id"
        element={
          <TuyenBaoVe>
            <BoCucChinh>
              <TrangTaoDonHang />
            </BoCucChinh>
          </TuyenBaoVe>
        }
      />

      <Route
        path="/purchases"
        element={
          <TuyenBaoVe>
            <BoCucChinh>
              <TrangNhapHang />
            </BoCucChinh>
          </TuyenBaoVe>
        }
      />

      <Route
        path="/purchases/new"
        element={
          <TuyenBaoVe>
            <BoCucChinh>
              <TrangTaoNhapHang />
            </BoCucChinh>
          </TuyenBaoVe>
        }
      />

      <Route
        path="/purchases/:id"
        element={
          <TuyenBaoVe>
            <BoCucChinh>
              <TrangTaoNhapHang />
            </BoCucChinh>
          </TuyenBaoVe>
        }
      />

      <Route
        path="/reports"
        element={
          <TuyenBaoVe requiredPermission="view_reports">
            <BoCucChinh>
              <TrangBaoCao />
            </BoCucChinh>
          </TuyenBaoVe>
        }
      />

      {/* Redirect root to dashboard */}
      <Route
        path="/"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
        }
      />

      {/* 404 Not Found */}
      <Route path="*" element={<TrangKhongTimThay />} />
    </Routes>
  )
}

export default UngDungDinhTuyen

