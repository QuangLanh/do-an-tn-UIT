import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, LogOut, X, Settings } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { Button } from './Button'
import { Input } from './Input'
import { Card } from './Card'
import { Modal } from './Modal'

export const UserMenu = () => {
  const navigate = useNavigate()
  const { user, logout, updateProfile, isLoading } = useAuthStore()
  const [isOpen, setIsOpen] = useState(false)
  const [settingsModalOpen, setSettingsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    address: user?.address || '',
  })
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        address: user.address || '',
      })
    }
  }, [user])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const openSettingsModal = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      address: user?.address || '',
    })
    setSettingsModalOpen(true)
  }

  const handleSaveProfile = async () => {
    try {
      await updateProfile(formData)
      setSettingsModalOpen(false)
      setIsOpen(false)
    } catch {
      // Error handled in store
    }
  }

  const handleLogout = () => {
    setIsOpen(false)
    logout()
    navigate('/')
  }

  if (!user) return null

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-0 rounded-full hover:opacity-80 transition-opacity"
        title={user.name || user.phone}
      >
        <div className="w-10 h-10 rounded-full bg-blue-400/30 dark:bg-blue-500/30 flex items-center justify-center backdrop-blur-sm border border-white/20">
          <User size={20} className="text-white drop-shadow-sm" />
        </div>
      </button>

      {isOpen && (
        <Card className="absolute right-0 mt-2 w-80 z-50 shadow-lg">
          <div className="space-y-4">
            {/* Name + Số điện thoại */}
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-3">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {user.name || 'Khách hàng'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {user.phone}
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X size={16} className="text-gray-500" />
              </button>
            </div>

            {/* Email, Địa chỉ (chỉ đọc) */}
            <div className="space-y-2">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                  {user.email || 'Chưa có'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Địa chỉ</label>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                  {user.address || 'Chưa có'}
                </p>
              </div>
            </div>

            {/* Chỉnh sửa thông tin → mở modal sửa tên, email, địa chỉ */}
            <Button
              size="sm"
              variant="secondary"
              onClick={openSettingsModal}
              className="w-full flex items-center justify-center gap-2"
            >
              <Settings size={18} />
              Chỉnh sửa thông tin
            </Button>

            {/* Đăng xuất */}
            <Button
              size="sm"
              variant="secondary"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <LogOut size={18} />
              Đăng xuất
            </Button>
          </div>
        </Card>
      )}

      {/* Modal thay đổi tên, email, địa chỉ */}
      <Modal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        title="Chỉnh sửa thông tin"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Tên"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Nhập tên"
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="Nhập email"
          />
          <Input
            label="Địa chỉ"
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Nhập địa chỉ"
          />
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              onClick={handleSaveProfile}
              isLoading={isLoading}
              className="flex-1"
            >
              Lưu
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setSettingsModalOpen(false)}
              className="flex-1"
            >
              Hủy
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
