/**
 * Navbar Component
 * Thanh navigation trên cùng
 */

import { Menu, Moon, Sun, LogOut, User } from 'lucide-react'
import { useThemeStore } from '@/kho-trang-thai/khoChuDe'
import { useSidebarStore } from '@/kho-trang-thai/khoThanhBen'
import { useAuthStore } from '@/kho-trang-thai/khoXacThuc'
import { useNavigate } from 'react-router-dom'

export const ThanhDieuHuong = () => {
  const { theme, toggleTheme } = useThemeStore()
  const { toggle } = useSidebarStore()
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

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

            {/* User Info */}
            {user && (
              <div className="flex items-center space-x-3">
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
              </div>
            )}

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-white hover:bg-white/20 transition-colors"
              title="Đăng xuất"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

