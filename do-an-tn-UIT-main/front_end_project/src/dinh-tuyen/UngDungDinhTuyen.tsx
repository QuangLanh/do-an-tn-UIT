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
import { TrangDanhSachDonDatHang } from '@/giao-dien/pages/TrangDanhSachDonDatHang'
import { TrangDonHangGhiNo } from '@/giao-dien/pages/TrangDonHangGhiNo'
import { TrangTaoDonHang } from '@/giao-dien/pages/TrangTaoDonHang'
import { TrangBanHang } from '@/giao-dien/pages/TrangBanHang'
import { TrangNhapHang } from '@/giao-dien/pages/TrangNhapHang'
import { TrangTaoNhapHang } from '@/giao-dien/pages/TrangTaoNhapHang'
import { TrangDoiTraHang } from '@/giao-dien/pages/TrangDoiTraHang'
import { TrangDanhSachTaiKhoan } from '@/giao-dien/pages/TrangDanhSachTaiKhoan'
import { TrangKhongTimThay } from '@/giao-dien/pages/TrangKhongTimThay'
// import { TrangDangNhapKhachHang } from '@/giao-dien/pages/khach-hang/TrangDangNhapKhachHang'
// import { TrangSanPhamKhachHang } from '@/giao-dien/pages/khach-hang/TrangSanPhamKhachHang'
// import { TrangChiTietSanPham } from '@/giao-dien/pages/khach-hang/TrangChiTietSanPham'
// import { TrangDanhSachMuaHang } from '@/giao-dien/pages/khach-hang/TrangDanhSachMuaHang'
// import { TrangLichSuMuaHang } from '@/giao-dien/pages/khach-hang/TrangLichSuMuaHang'
import { TrangNhaCungCap } from '@/giao-dien/pages/TrangNhaCungCap'

const UngDungDinhTuyen = () => {
  const { isAuthenticated } = useAuthStore()

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          isAuthenticated
            ? <Navigate to="/dashboard" replace />
            : <TrangDangNhap />
        }
      />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <TuyenBaoVe requiredRoles={['admin', 'staff']}>
            <BoCucChinh>
              <TrangBangDieuKhien />
            </BoCucChinh>
          </TuyenBaoVe>
        }
      />

      <Route
        path="/products"
        element={
          <TuyenBaoVe requiredRoles={['admin', 'staff']}>
            <BoCucChinh>
              <TrangSanPham />
            </BoCucChinh>
          </TuyenBaoVe>
        }
      />

      <Route
        path="/inventory"
        element={
          <TuyenBaoVe requiredRoles={['admin', 'staff']}>
            <BoCucChinh>
              <TrangKiemKe />
            </BoCucChinh>
          </TuyenBaoVe>
        }
      />

      <Route
        path="/sales"
        element={
          <TuyenBaoVe requiredRoles={['admin', 'staff']} requiredPermission="create_order">
            <BoCucChinh>
              <TrangBanHang />
            </BoCucChinh>
          </TuyenBaoVe>
        }
      />

      <Route
        path="/orders/new"
        element={
          <TuyenBaoVe requiredRoles={['admin', 'staff']} requiredPermission="create_order">
            <BoCucChinh>
              <TrangTaoDonHang />
            </BoCucChinh>
          </TuyenBaoVe>
        }
      />

      <Route
        path="/orders/list"
        element={
          <TuyenBaoVe requiredRoles={['admin', 'staff']}>
            <BoCucChinh>
              <TrangDanhSachDonDatHang />
            </BoCucChinh>
          </TuyenBaoVe>
        }
      />

      <Route
        path="/orders/debts"
        element={
          <TuyenBaoVe requiredRoles={['admin', 'staff']}>
            <BoCucChinh>
              <TrangDonHangGhiNo />
            </BoCucChinh>
          </TuyenBaoVe>
        }
      />

      <Route
        path="/orders/:id"
        element={
          <TuyenBaoVe requiredRoles={['admin', 'staff']} requiredPermission="view_orders">
            <BoCucChinh>
              <TrangTaoDonHang />
            </BoCucChinh>
          </TuyenBaoVe>
        }
      />

      <Route
        path="/orders"
        element={
          <TuyenBaoVe requiredRoles={['admin', 'staff']}>
            <BoCucChinh>
              <TrangDonHang />
            </BoCucChinh>
          </TuyenBaoVe>
        }
      />

      <Route
        path="/returns-exchanges"
        element={
          <TuyenBaoVe requiredRoles={['admin', 'staff']}>
            <BoCucChinh>
              <TrangDoiTraHang />
            </BoCucChinh>
          </TuyenBaoVe>
        }
      />

      <Route
        path="/purchases"
        element={
          <TuyenBaoVe requiredRoles={['admin', 'staff']}>
            <BoCucChinh>
              <TrangNhapHang />
            </BoCucChinh>
          </TuyenBaoVe>
        }
      />

      <Route
        path="/purchases/new"
        element={
          <TuyenBaoVe requiredRoles={['admin', 'staff']} requiredPermission="create_purchase">
            <BoCucChinh>
              <TrangTaoNhapHang />
            </BoCucChinh>
          </TuyenBaoVe>
        }
      />

      <Route
        path="/purchases/:id"
        element={
          <TuyenBaoVe requiredRoles={['admin', 'staff']} requiredPermission="view_purchases">
            <BoCucChinh>
              <TrangTaoNhapHang />
            </BoCucChinh>
          </TuyenBaoVe>
        }
      />

            <Route
        path="/nha-cung-cap"
        element={
          <TuyenBaoVe requiredRoles={['admin', 'staff']}>
            <BoCucChinh>
              <TrangNhaCungCap />
            </BoCucChinh>
          </TuyenBaoVe>
        }
      />

      <Route
        path="/reports"
        element={
          <TuyenBaoVe requiredRoles={['admin']} requiredPermission="view_reports">
            <BoCucChinh>
              <TrangBaoCao />
            </BoCucChinh>
          </TuyenBaoVe>
        }
      />

      <Route
        path="/accounts"
        element={
          <TuyenBaoVe requiredRoles={['admin']} requiredPermission="manage_users">
            <BoCucChinh>
              <TrangDanhSachTaiKhoan />
            </BoCucChinh>
          </TuyenBaoVe>
        }
      />

      {/* Redirect root to dashboard */}
      <Route
        path="/"
        element={
          isAuthenticated
            ? <Navigate to="/dashboard" replace />
            : <Navigate to="/login" replace />
        }
      />

      {/* 404 Not Found */}
      <Route path="*" element={<TrangKhongTimThay />} />
    </Routes>
  )
}

export default UngDungDinhTuyen

