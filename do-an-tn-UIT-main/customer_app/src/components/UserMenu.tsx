import { useState, useRef, useEffect } from 'react'
import { User, LogOut, X } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { Button } from './Button'
import { Input } from './Input'
import { Card } from './Card'
import toast from 'react-hot-toast'

export const UserMenu = () => {
  const { user, logout, updateProfile, isLoading } = useAuthStore()
  const [isOpen, setIsOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    email: user?.email || '',
    address: user?.address || '',
  })
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        address: user.address || '',
      })
    }
  }, [user])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setIsEditing(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleSave = async () => {
    try {
      await updateProfile(formData)
      setIsEditing(false)
      toast.success('Cập nhật thông tin thành công')
    } catch (error) {
      // Error handled in store
    }
  }

  const handleCancel = () => {
    setFormData({
      email: user?.email || '',
      address: user?.address || '',
    })
    setIsEditing(false)
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
            {/* Header */}
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

            {/* Profile Form */}
            {isEditing ? (
              <div className="space-y-3">
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
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSave}
                    isLoading={isLoading}
                    className="flex-1"
                  >
                    Lưu
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleCancel}
                    className="flex-1"
                  >
                    Hủy
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {user.email || 'Chưa có'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Địa chỉ
                  </label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {user.address || 'Chưa có'}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setIsEditing(true)}
                  className="w-full"
                >
                  Chỉnh sửa thông tin
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
