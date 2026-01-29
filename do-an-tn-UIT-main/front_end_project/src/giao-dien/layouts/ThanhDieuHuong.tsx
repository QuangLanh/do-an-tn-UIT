/**
 * Navbar Component
 * Thanh navigation trên cùng
 */

import { useState, useRef, useEffect, FormEvent } from 'react'
import { Menu, Moon, Sun, LogOut, User, Settings, X } from 'lucide-react'
import { useThemeStore } from '@/kho-trang-thai/khoChuDe'
import { useSidebarStore } from '@/kho-trang-thai/khoThanhBen'
import { useAuthStore } from '@/kho-trang-thai/khoXacThuc'
import { useNavigate } from 'react-router-dom'
import { HopThoai } from '@/giao-dien/components/HopThoai'
import { NhapLieu } from '@/giao-dien/components/NhapLieu'
import { NutBam } from '@/giao-dien/components/NutBam'
import { apiService } from '@/ha-tang/api'
import { normalizePhoneInput, isValidPhone10 } from '@/ha-tang/utils/formatters'
import toast from 'react-hot-toast'

export const ThanhDieuHuong = () => {
  const { theme, toggleTheme } = useThemeStore()
  const { toggle } = useSidebarStore()
  const { user, logout, updateUser } = useAuthStore()
  const navigate = useNavigate()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const [profileForm, setProfileForm] = useState({
    fullName: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [profileSaving, setProfileSaving] = useState(false)

  useEffect(() => {
    if (!showUserMenu) return
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showUserMenu])

  const handleLogout = () => {
    setShowUserMenu(false)
    logout()
    navigate('/login')
  }

  const openProfileModal = () => {
    setProfileForm({
      fullName: user?.fullName ?? '',
      phone: user?.soDienThoai ?? '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    })
    setShowProfileModal(true)
    setShowUserMenu(false)
  }

  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!user || user.role === 'customer') return
    if (profileForm.phone.trim() && !isValidPhone10(profileForm.phone)) {
      toast.error('Số điện thoại phải đúng 10 số (ví dụ: 0123456789).')
      return
    }
    const isAdmin = user.role === 'admin'
    if (isAdmin && profileForm.newPassword) {
      if (!profileForm.currentPassword.trim()) {
        toast.error('Vui lòng nhập mật khẩu hiện tại để đổi mật khẩu.')
        return
      }
      if (profileForm.newPassword.length < 6) {
        toast.error('Mật khẩu mới tối thiểu 6 ký tự.')
        return
      }
      if (profileForm.newPassword !== profileForm.confirmPassword) {
        toast.error('Mật khẩu mới và xác nhận không trùng khớp.')
        return
      }
    }
    setProfileSaving(true)
    try {
      const payload: {
        fullName?: string
        phone?: string
        currentPassword?: string
        newPassword?: string
      } = {
        fullName: profileForm.fullName.trim() || undefined,
        phone: profileForm.phone.trim() || undefined,
      }
      if (isAdmin && profileForm.newPassword) {
        payload.currentPassword = profileForm.currentPassword
        payload.newPassword = profileForm.newPassword
      }
      const res = await apiService.auth.updateProfile(payload)
      updateUser({
        fullName: res.fullName,
        soDienThoai: (res as any).phone ?? res.soDienThoai,
      })
      toast.success('Cập nhật thông tin thành công.')
      setShowProfileModal(false)
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Cập nhật thất bại.'
      toast.error(Array.isArray(msg) ? msg[0] : msg)
    } finally {
      setProfileSaving(false)
    }
  }

  const canEditProfile = user && (user.role === 'admin' || user.role === 'staff')

  return (
    <nav className="bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-700 dark:to-primary-800 shadow-lg sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side */}
          <div className="flex items-center">
            <button
              onClick={toggle}
              className="p-2 rounded-lg text-white hover:bg-white/20 transition-colors"
            >
              <Menu size={24} />
            </button>
            <h1 className="ml-4 text-xl font-bold text-white">
              🏪 Quản Lý Tạp Hóa
            </h1>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-white hover:bg-white/20 transition-colors"
              title="Toggle theme"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            {/* User Info + Dropdown (giống customer app: tên, SĐT, email, Chỉnh sửa thông tin, Đăng xuất) */}
            {user && (
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setShowUserMenu((v) => !v)}
                  className="flex items-center space-x-3 rounded-lg p-1 pr-2 text-white hover:bg-white/20 transition-colors"
                  title="Tài khoản"
                >
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-medium text-white">
                      {user.fullName}
                    </p>
                    <p className="text-xs text-primary-100 capitalize">
                      {user?.role === 'admin'
                        ? 'Quản trị viên'
                        : user?.role === 'staff'
                          ? 'Nhân viên'
                          : 'Khách hàng'}
                    </p>
                  </div>
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 text-white">
                    <User size={20} />
                  </div>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-1 w-80 rounded-lg bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                    {/* Tên + Số điện thoại + nút đóng */}
                    <div className="flex items-start justify-between border-b border-gray-200 dark:border-gray-700 p-4">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {user.fullName || 'Người dùng'}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                          {user.soDienThoai || '—'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowUserMenu(false)}
                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    {/* Email + Địa chỉ (chỉ đọc, giống thiết kế popup) */}
                    <div className="px-4 py-3 space-y-3 border-b border-gray-200 dark:border-gray-700">
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                          {user.email || 'Chưa có'}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Địa chỉ</label>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                          {user.diaChi || '—'}
                        </p>
                      </div>
                    </div>

                    {/* Chỉnh sửa thông tin → mở modal sửa tên, SĐT, mật khẩu (admin) */}
                    {canEditProfile && (
                      <div className="px-4 pb-2">
                        <button
                          type="button"
                          onClick={openProfileModal}
                          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          <Settings size={18} />
                          Chỉnh sửa thông tin
                        </button>
                      </div>
                    )}

                    {/* Đăng xuất */}
                    <div className="p-4 pt-0">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm font-medium border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <LogOut size={18} />
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal cập nhật thông tin cá nhân */}
      <HopThoai
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        title="Cập nhật thông tin cá nhân"
        size="md"
      >
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <NhapLieu
            label="Họ tên"
            value={profileForm.fullName}
            onChange={(e) =>
              setProfileForm((s) => ({ ...s, fullName: e.target.value }))
            }
          />
          <NhapLieu
            label="Số điện thoại"
            type="tel"
            inputMode="numeric"
            maxLength={10}
            placeholder="0xxxxxxxxx (10 số)"
            value={profileForm.phone}
            onChange={(e) =>
              setProfileForm((s) => ({ ...s, phone: normalizePhoneInput(e.target.value) }))
            }
          />

          {/* Chỉ quản trị viên mới được đổi mật khẩu */}
          {user?.role === 'admin' && (
            <div className="pt-2 border-t border-gray-200 dark:border-gray-600 space-y-4">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Đổi mật khẩu (chỉ quản trị viên)
            </p>
            <NhapLieu
              label="Mật khẩu hiện tại"
              type="password"
              value={profileForm.currentPassword}
              onChange={(e) =>
                setProfileForm((s) => ({ ...s, currentPassword: e.target.value }))
              }
              placeholder="Để trống nếu không đổi"
            />
            <NhapLieu
              label="Mật khẩu mới"
              type="password"
              value={profileForm.newPassword}
              onChange={(e) =>
                setProfileForm((s) => ({ ...s, newPassword: e.target.value }))
              }
              placeholder="Tối thiểu 6 ký tự"
            />
            <NhapLieu
              label="Xác nhận mật khẩu mới"
              type="password"
              value={profileForm.confirmPassword}
              onChange={(e) =>
                setProfileForm((s) => ({ ...s, confirmPassword: e.target.value }))
              }
            />
          </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <NutBam
              type="button"
              variant="secondary"
              onClick={() => setShowProfileModal(false)}
            >
              Hủy
            </NutBam>
            <NutBam type="submit" isLoading={profileSaving}>
              Lưu
            </NutBam>
          </div>
        </form>
      </HopThoai>
    </nav>
  )
}

