/**
 * Account List Page
 * Trang danh sách tài khoản: Khách hàng + Nhân viên (Admin only)
 */

import { useState, useEffect } from 'react'
import { TheThongTin } from '@/giao-dien/components/TheThongTin'
import { BangDuLieu } from '@/giao-dien/components/BangDuLieu'
import { HuyHieu } from '@/giao-dien/components/HuyHieu'
import { HopThoai } from '@/giao-dien/components/HopThoai'
import { NutBam } from '@/giao-dien/components/NutBam'
import { NhapLieu } from '@/giao-dien/components/NhapLieu'
import { apiService } from '@/ha-tang/api'
import { Users, UserCircle, Plus } from 'lucide-react'
import toast from 'react-hot-toast'

type TabType = 'staff' | 'customer'

export interface StaffUser {
  id: string
  _id?: string
  email: string
  fullName: string
  phone?: string
  role: string
  isActive: boolean
  address?: string
}

export interface CustomerUser {
  id: string
  _id?: string
  soDienThoai: string
  ten?: string
  email?: string
  diaChi?: string
  isActive?: boolean
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  staff: 'Nhân viên',
  customer: 'Khách hàng',
}

export const TrangDanhSachTaiKhoan = () => {
  const [activeTab, setActiveTab] = useState<TabType>('staff')
  const [staffList, setStaffList] = useState<StaffUser[]>([])
  const [customerList, setCustomerList] = useState<CustomerUser[]>([])
  const [isLoadingStaff, setIsLoadingStaff] = useState(false)
  const [isLoadingCustomer, setIsLoadingCustomer] = useState(false)

  const [editStaff, setEditStaff] = useState<StaffUser | null>(null)
  const [editCustomer, setEditCustomer] = useState<CustomerUser | null>(null)
  const [createStaff, setCreateStaff] = useState(false)
  const [createCustomer, setCreateCustomer] = useState(false)
  const [formStaff, setFormStaff] = useState({ email: '', fullName: '', phone: '', role: 'staff', isActive: true, password: '', address: '' })
  const [formCustomer, setFormCustomer] = useState({ ten: '', soDienThoai: '', email: '', diaChi: '', isActive: true })
  const [formCreateStaff, setFormCreateStaff] = useState({ email: '', fullName: '', phone: '', role: 'staff', password: '', address: '' })
  const [formCreateCustomer, setFormCreateCustomer] = useState({ ten: '', soDienThoai: '', email: '', diaChi: '', isActive: true })
  const [saving, setSaving] = useState(false)

  const loadStaff = async () => {
    try {
      setIsLoadingStaff(true)
      const data = await apiService.users.list()
      const list = Array.isArray(data) ? data : []
      setStaffList(
        list.map((u: any) => ({
          id: u._id || u.id,
          _id: u._id,
          email: u.email,
          fullName: u.fullName,
          phone: u.phone,
          role: u.role,
          isActive: u.isActive !== false,
          address: u.address,
        }))
      )
    } catch (error) {
      toast.error('Không thể tải danh sách nhân viên')
      console.error(error)
    } finally {
      setIsLoadingStaff(false)
    }
  }

  const loadCustomers = async () => {
    try {
      setIsLoadingCustomer(true)
      const data = await apiService.customers.list()
      console.log('Customers data received:', data)
      const list = Array.isArray(data) ? data : []
      console.log('Customers list length:', list.length)
      setCustomerList(
        list.map((c: any) => ({
          id: c._id || c.id,
          _id: c._id,
          soDienThoai: c.soDienThoai,
          ten: c.ten,
          email: c.email,
          diaChi: c.diaChi,
          isActive: c.isActive !== false,
        }))
      )
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Không thể tải danh sách khách hàng'
      toast.error(errorMessage)
      console.error('Error loading customers:', error)
      console.error('Error response:', error?.response)
      setCustomerList([])
    } finally {
      setIsLoadingCustomer(false)
    }
  }

  useEffect(() => {
    loadStaff()
  }, [])

  useEffect(() => {
    if (activeTab === 'customer') {
      loadCustomers()
    }
  }, [activeTab])

  const openEditStaff = (row: StaffUser) => {
    setEditStaff(row)
    setFormStaff({
      fullName: row.fullName || '',
      phone: row.phone || '',
      role: row.role || 'staff',
      isActive: row.isActive !== false,
      password: '',
    })
  }

  const openEditCustomer = (row: CustomerUser) => {
    setEditCustomer(row)
    setFormCustomer({
      ten: row.ten || '',
      soDienThoai: row.soDienThoai || '',
      email: row.email || '',
      diaChi: row.diaChi || '',
      isActive: row.isActive !== false,
    })
  }

  const handleSaveStaff = async () => {
    if (!editStaff) return
    try {
      setSaving(true)
      const payload: any = {
        fullName: formStaff.fullName,
        phone: formStaff.phone,
        role: formStaff.role,
        isActive: formStaff.isActive,
      }
      if (formStaff.password.trim()) {
        payload.password = formStaff.password
      }
      await apiService.users.update(editStaff.id, payload)
      toast.success('Đã cập nhật nhân viên')
      setEditStaff(null)
      loadStaff()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể cập nhật')
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  const handleSaveCustomer = async () => {
    if (!editCustomer) return
    try {
      setSaving(true)
      await apiService.customers.update(editCustomer.id, {
        ten: formCustomer.ten,
        soDienThoai: formCustomer.soDienThoai,
        email: formCustomer.email || undefined,
        diaChi: formCustomer.diaChi || undefined,
        isActive: formCustomer.isActive,
      })
      toast.success('Đã cập nhật khách hàng')
      setEditCustomer(null)
      loadCustomers()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể cập nhật')
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  const handleCreateStaff = async () => {
    if (!formCreateStaff.email || !formCreateStaff.password || !formCreateStaff.fullName) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc')
      return
    }
    try {
      setSaving(true)
      await apiService.users.create({
        email: formCreateStaff.email,
        password: formCreateStaff.password,
        fullName: formCreateStaff.fullName,
        phone: formCreateStaff.phone || undefined,
        role: formCreateStaff.role,
        address: formCreateStaff.address || undefined,
      })
      toast.success('Đã tạo nhân viên mới')
      setCreateStaff(false)
      setFormCreateStaff({ email: '', fullName: '', phone: '', role: 'staff', password: '', address: '' })
      loadStaff()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể tạo nhân viên')
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  const handleCreateCustomer = async () => {
    if (!formCreateCustomer.soDienThoai) {
      toast.error('Vui lòng nhập số điện thoại')
      return
    }
    try {
      setSaving(true)
      await apiService.customers.create({
        soDienThoai: formCreateCustomer.soDienThoai,
        ten: formCreateCustomer.ten || undefined,
        email: formCreateCustomer.email || undefined,
        diaChi: formCreateCustomer.diaChi || undefined,
        isActive: formCreateCustomer.isActive,
      })
      toast.success('Đã tạo khách hàng mới')
      setCreateCustomer(false)
      setFormCreateCustomer({ ten: '', soDienThoai: '', email: '', diaChi: '', isActive: true })
      loadCustomers()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể tạo khách hàng')
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  const isLoading = activeTab === 'staff' ? isLoadingStaff : isLoadingCustomer

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center px-0">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Danh sách tài khoản</h1>
        <NutBam
          type="button"
          onClick={() => {
            if (activeTab === 'staff') {
              setCreateStaff(true)
            } else {
              setCreateCustomer(true)
            }
          }}
        >
          <Plus size={20} className="mr-2" />
          Tạo mới
        </NutBam>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={() => setActiveTab('staff')}
          className={`flex items-center gap-2 px-6 py-3 font-medium border-b-2 transition-colors ${
            activeTab === 'staff'
              ? 'border-primary-600 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Users size={20} />
          Nhân viên
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('customer')}
          className={`flex items-center gap-2 px-6 py-3 font-medium border-b-2 transition-colors ${
            activeTab === 'customer'
              ? 'border-primary-600 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <UserCircle size={20} />
          Khách hàng
        </button>
      </div>

      {/* Content */}
      <TheThongTin className="no-padding">
        {isLoading ? (
          <div className="flex justify-center py-12 text-gray-500 dark:text-gray-400">Đang tải...</div>
        ) : activeTab === 'staff' ? (
          <BangDuLieu
            data={staffList}
            columns={[
              { header: 'Email', accessor: (r: StaffUser) => r.email, className: 'whitespace-nowrap' },
              { header: 'Họ tên', accessor: (r: StaffUser) => r.fullName },
              { header: 'Số điện thoại', accessor: (r: StaffUser) => r.phone || '—' },
              { header: 'Vai trò', accessor: (r: StaffUser) => ROLE_LABELS[r.role] || r.role },
              {
                header: 'Trạng thái',
                accessor: (r: StaffUser) =>
                  r.isActive ? (
                    <HuyHieu variant="success">Hoạt động</HuyHieu>
                  ) : (
                    <HuyHieu variant="danger">Đã khóa</HuyHieu>
                  ),
              },
              {
                header: 'Thao tác',
                accessor: (r: StaffUser) => (
                  <NutBam
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation()
                      openEditStaff(r)
                    }}
                  >
                    Sửa
                  </NutBam>
                ),
              },
            ]}
          />
        ) : (
          <BangDuLieu
            data={customerList}
            columns={[
              { header: 'Số điện thoại', accessor: (r: CustomerUser) => r.soDienThoai, className: 'whitespace-nowrap' },
              { header: 'Tên', accessor: (r: CustomerUser) => r.ten || '—' },
              { header: 'Email', accessor: (r: CustomerUser) => r.email || '—' },
              { header: 'Địa chỉ', accessor: (r: CustomerUser) => r.diaChi || '—' },
              {
                header: 'Trạng thái',
                accessor: (r: CustomerUser) =>
                  r.isActive !== false ? (
                    <HuyHieu variant="success">Hoạt động</HuyHieu>
                  ) : (
                    <HuyHieu variant="danger">Đã khóa</HuyHieu>
                  ),
              },
              {
                header: 'Thao tác',
                accessor: (r: CustomerUser) => (
                  <NutBam
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation()
                      openEditCustomer(r)
                    }}
                  >
                    Sửa
                  </NutBam>
                ),
              },
            ]}
          />
        )}
      </TheThongTin>

      {/* Edit Staff Modal */}
      <HopThoai
        isOpen={!!editStaff}
        onClose={() => setEditStaff(null)}
        title="Chỉnh sửa nhân viên"
        size="md"
      >
        {editStaff && (
          <div className="space-y-4">
            <NhapLieu label="Email" value={editStaff.email} disabled className="bg-gray-100 dark:bg-gray-700" />
            <NhapLieu
              label="Họ tên"
              value={formStaff.fullName}
              onChange={(e) => setFormStaff((s) => ({ ...s, fullName: e.target.value }))}
            />
            <NhapLieu
              label="Số điện thoại"
              value={formStaff.phone}
              onChange={(e) => setFormStaff((s) => ({ ...s, phone: e.target.value }))}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vai trò</label>
              <select
                value={formStaff.role}
                onChange={(e) => setFormStaff((s) => ({ ...s, role: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              >
                <option value="admin">Admin</option>
                <option value="staff">Nhân viên</option>
              </select>
            </div>
            <NhapLieu
              label="Mật khẩu mới (để trống nếu không đổi)"
              type="password"
              value={formStaff.password}
              onChange={(e) => setFormStaff((s) => ({ ...s, password: e.target.value }))}
              placeholder="Để trống nếu không đổi"
            />
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formStaff.isActive}
                onChange={(e) => setFormStaff((s) => ({ ...s, isActive: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Tài khoản hoạt động</span>
            </label>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <NutBam type="button" variant="secondary" onClick={() => setEditStaff(null)}>
                Hủy
              </NutBam>
              <NutBam type="button" onClick={handleSaveStaff} disabled={saving}>
                {saving ? 'Đang lưu...' : 'Lưu'}
              </NutBam>
            </div>
          </div>
        )}
      </HopThoai>

      {/* Edit Customer Modal */}
      <HopThoai
        isOpen={!!editCustomer}
        onClose={() => setEditCustomer(null)}
        title="Chỉnh sửa khách hàng"
        size="md"
      >
        {editCustomer && (
          <div className="space-y-4">
            <NhapLieu
              label="Số điện thoại"
              value={formCustomer.soDienThoai}
              onChange={(e) => setFormCustomer((s) => ({ ...s, soDienThoai: e.target.value }))}
              placeholder="0xxxxxxxxx"
            />
            <NhapLieu
              label="Tên"
              value={formCustomer.ten}
              onChange={(e) => setFormCustomer((s) => ({ ...s, ten: e.target.value }))}
            />
            <NhapLieu
              label="Email"
              type="email"
              value={formCustomer.email}
              onChange={(e) => setFormCustomer((s) => ({ ...s, email: e.target.value }))}
            />
            <NhapLieu
              label="Địa chỉ"
              value={formCustomer.diaChi}
              onChange={(e) => setFormCustomer((s) => ({ ...s, diaChi: e.target.value }))}
            />
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formCustomer.isActive}
                onChange={(e) => setFormCustomer((s) => ({ ...s, isActive: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Tài khoản hoạt động</span>
            </label>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <NutBam type="button" variant="secondary" onClick={() => setEditCustomer(null)}>
                Hủy
              </NutBam>
              <NutBam type="button" onClick={handleSaveCustomer} disabled={saving}>
                {saving ? 'Đang lưu...' : 'Lưu'}
              </NutBam>
            </div>
          </div>
        )}
      </HopThoai>

      {/* Create Staff Modal */}
      <HopThoai
        isOpen={createStaff}
        onClose={() => {
          setCreateStaff(false)
          setFormCreateStaff({ email: '', fullName: '', phone: '', role: 'staff', password: '', address: '' })
        }}
        title="Tạo nhân viên mới"
        size="md"
      >
        <div className="space-y-4">
          <NhapLieu
            label="Email *"
            type="email"
            value={formCreateStaff.email}
            onChange={(e) => setFormCreateStaff((s) => ({ ...s, email: e.target.value }))}
            placeholder="user@example.com"
            required
          />
          <NhapLieu
            label="Mật khẩu *"
            type="password"
            value={formCreateStaff.password}
            onChange={(e) => setFormCreateStaff((s) => ({ ...s, password: e.target.value }))}
            placeholder="Tối thiểu 6 ký tự"
            required
          />
          <NhapLieu
            label="Họ tên *"
            value={formCreateStaff.fullName}
            onChange={(e) => setFormCreateStaff((s) => ({ ...s, fullName: e.target.value }))}
            required
          />
          <NhapLieu
            label="Số điện thoại"
            value={formCreateStaff.phone}
            onChange={(e) => setFormCreateStaff((s) => ({ ...s, phone: e.target.value }))}
            placeholder="0xxxxxxxxx"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vai trò *</label>
            <select
              value={formCreateStaff.role}
              onChange={(e) => setFormCreateStaff((s) => ({ ...s, role: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            >
              <option value="admin">Admin</option>
              <option value="staff">Nhân viên</option>
            </select>
          </div>
          <NhapLieu
            label="Địa chỉ"
            value={formCreateStaff.address}
            onChange={(e) => setFormCreateStaff((s) => ({ ...s, address: e.target.value }))}
          />
          <div className="flex justify-end gap-2 pt-4 border-t">
            <NutBam
              type="button"
              variant="secondary"
              onClick={() => {
                setCreateStaff(false)
                setFormCreateStaff({ email: '', fullName: '', phone: '', role: 'staff', password: '', address: '' })
              }}
            >
              Hủy
            </NutBam>
            <NutBam type="button" onClick={handleCreateStaff} disabled={saving}>
              {saving ? 'Đang tạo...' : 'Tạo mới'}
            </NutBam>
          </div>
        </div>
      </HopThoai>

      {/* Create Customer Modal */}
      <HopThoai
        isOpen={createCustomer}
        onClose={() => {
          setCreateCustomer(false)
          setFormCreateCustomer({ ten: '', soDienThoai: '', email: '', diaChi: '', isActive: true })
        }}
        title="Tạo khách hàng mới"
        size="md"
      >
        <div className="space-y-4">
          <NhapLieu
            label="Số điện thoại *"
            value={formCreateCustomer.soDienThoai}
            onChange={(e) => setFormCreateCustomer((s) => ({ ...s, soDienThoai: e.target.value }))}
            placeholder="0xxxxxxxxx"
            required
          />
          <NhapLieu
            label="Tên"
            value={formCreateCustomer.ten}
            onChange={(e) => setFormCreateCustomer((s) => ({ ...s, ten: e.target.value }))}
          />
          <NhapLieu
            label="Email"
            type="email"
            value={formCreateCustomer.email}
            onChange={(e) => setFormCreateCustomer((s) => ({ ...s, email: e.target.value }))}
          />
          <NhapLieu
            label="Địa chỉ"
            value={formCreateCustomer.diaChi}
            onChange={(e) => setFormCreateCustomer((s) => ({ ...s, diaChi: e.target.value }))}
          />
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formCreateCustomer.isActive}
              onChange={(e) => setFormCreateCustomer((s) => ({ ...s, isActive: e.target.checked }))}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Tài khoản hoạt động</span>
          </label>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <NutBam
              type="button"
              variant="secondary"
              onClick={() => {
                setCreateCustomer(false)
                setFormCreateCustomer({ ten: '', soDienThoai: '', email: '', diaChi: '', isActive: true })
              }}
            >
              Hủy
            </NutBam>
            <NutBam type="button" onClick={handleCreateCustomer} disabled={saving}>
              {saving ? 'Đang tạo...' : 'Tạo mới'}
            </NutBam>
          </div>
        </div>
      </HopThoai>
    </div>
  )
}
