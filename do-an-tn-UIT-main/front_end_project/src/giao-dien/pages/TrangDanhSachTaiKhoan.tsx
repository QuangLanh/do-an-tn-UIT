/**
 * Account List Page
 * Trang danh sách tài khoản: Khách hàng + Nhân viên (Admin only)
 */

import { useState, useEffect, useMemo } from 'react'
import { TheThongTin } from '@/giao-dien/components/TheThongTin'
import { BangDuLieu } from '@/giao-dien/components/BangDuLieu'
import { PhanTrang } from '@/giao-dien/components/PhanTrang'
import { HuyHieu } from '@/giao-dien/components/HuyHieu'
import { HopThoai } from '@/giao-dien/components/HopThoai'
import { NutBam } from '@/giao-dien/components/NutBam'
import { NhapLieu } from '@/giao-dien/components/NhapLieu'
import { apiService } from '@/ha-tang/api'
import { normalizePhoneInput, isValidPhone10 } from '@/ha-tang/utils/formatters'
import { Users, UserCircle, Plus, RefreshCw, Search } from 'lucide-react'
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
  const [syncingCustomers, setSyncingCustomers] = useState(false)

  const [staffCurrentPage, setStaffCurrentPage] = useState(1)
  const [staffItemsPerPage, setStaffItemsPerPage] = useState(5)
  const [customerCurrentPage, setCustomerCurrentPage] = useState(1)
  const [customerItemsPerPage, setCustomerItemsPerPage] = useState(5)
  const [customerSearchPhone, setCustomerSearchPhone] = useState('')

  const loadStaff = async () => {
    try {
      setIsLoadingStaff(true)
      const data = await apiService.users.list()
      const list = Array.isArray(data) ? data : []
      const staffOnly = list
        .filter((u: any) => (u.role || '').toLowerCase() === 'staff')
        .map((u: any) => ({
          id: u._id || u.id,
          _id: u._id,
          email: u.email,
          fullName: u.fullName,
          phone: u.phone,
          role: u.role,
          isActive: u.isActive !== false,
          address: u.address,
        }))
      setStaffList(staffOnly)
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
      email: row.email || '',
      fullName: row.fullName || '',
      phone: row.phone || '',
      role: row.role || 'staff',
      isActive: row.isActive !== false,
      password: '',
      address: row.address || '',
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
    if (formStaff.phone.trim() && !isValidPhone10(formStaff.phone)) {
      toast.error('Số điện thoại phải đúng 10 số (ví dụ: 0123456789).')
      return
    }
    try {
      setSaving(true)
      const payload: any = {
        fullName: formStaff.fullName,
        phone: formStaff.phone,
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
    if (!isValidPhone10(formCustomer.soDienThoai)) {
      toast.error('Số điện thoại phải đúng 10 số (ví dụ: 0123456789).')
      return
    }
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
    if (formCreateStaff.phone.trim() && !isValidPhone10(formCreateStaff.phone)) {
      toast.error('Số điện thoại phải đúng 10 số (ví dụ: 0123456789).')
      return
    }
    try {
      setSaving(true)
      await apiService.users.create({
        email: formCreateStaff.email,
        password: formCreateStaff.password,
        fullName: formCreateStaff.fullName,
        phone: formCreateStaff.phone || undefined,
        role: 'staff', // Tạo mới chỉ được vai trò Nhân viên, hệ thống chỉ có một Admin
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
    if (!isValidPhone10(formCreateCustomer.soDienThoai)) {
      toast.error('Số điện thoại phải đúng 10 số (ví dụ: 0123456789).')
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

  const handleSyncCustomersFromOrders = async () => {
    try {
      setSyncingCustomers(true)
      const res = await apiService.customers.syncFromOrders()
      const msg = (res as any)?.message ?? `Đã đồng bộ ${(res as any)?.created ?? 0} khách hàng mới, ${(res as any)?.updated ?? 0} cập nhật.`
      toast.success(msg)
      loadCustomers()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể đồng bộ khách hàng từ đơn hàng')
      console.error(error)
    } finally {
      setSyncingCustomers(false)
    }
  }

  const isLoading = activeTab === 'staff' ? isLoadingStaff : isLoadingCustomer

  const paginatedStaffList = useMemo(() => {
    const start = (staffCurrentPage - 1) * staffItemsPerPage
    return staffList.slice(start, start + staffItemsPerPage)
  }, [staffList, staffCurrentPage, staffItemsPerPage])

  const filteredCustomerList = useMemo(() => {
    const q = customerSearchPhone.trim().toLowerCase()
    if (!q) return customerList
    return customerList.filter((c) =>
      (c.soDienThoai || '').toLowerCase().includes(q)
    )
  }, [customerList, customerSearchPhone])

  const paginatedCustomerList = useMemo(() => {
    const start = (customerCurrentPage - 1) * customerItemsPerPage
    return filteredCustomerList.slice(start, start + customerItemsPerPage)
  }, [filteredCustomerList, customerCurrentPage, customerItemsPerPage])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center px-0">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Danh sách tài khoản</h1>
        {/* Nhân viên: Tạo mới. Khách hàng: Đồng bộ từ đơn hàng (SĐT làm khóa chính, mỗi SĐT = 1 khách). */}
        {activeTab === 'staff' && (
          <NutBam
            type="button"
            onClick={() => setCreateStaff(true)}
          >
            <Plus size={20} className="mr-2" />
            Tạo mới
          </NutBam>
        )}
        {activeTab === 'customer' && (
          <NutBam
            type="button"
            variant="secondary"
            onClick={handleSyncCustomersFromOrders}
            isLoading={syncingCustomers}
          >
            <RefreshCw size={20} className="mr-2" />
            Đồng bộ từ đơn hàng
          </NutBam>
        )}
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

      {/* Tìm kiếm theo SĐT (chỉ tab Khách hàng) */}
      {activeTab === 'customer' && (
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-xs">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="tel"
              inputMode="numeric"
              placeholder="Tìm theo số điện thoại..."
              value={customerSearchPhone}
              onChange={(e) => {
                setCustomerSearchPhone(normalizePhoneInput(e.target.value))
                setCustomerCurrentPage(1)
              }}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      )}

      {/* Bảng danh sách (không gồm pagination) */}
      <TheThongTin className="no-padding">
        {isLoading ? (
          <div className="flex justify-center py-12 text-gray-500 dark:text-gray-400">Đang tải...</div>
        ) : activeTab === 'staff' ? (
          <BangDuLieu
            data={paginatedStaffList}
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
            data={paginatedCustomerList}
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

      {/* Phân trang đặt bên ngoài bảng */}
      {!isLoading && activeTab === 'staff' && (
        <PhanTrang
          currentPage={staffCurrentPage}
          totalItems={staffList.length}
          itemsPerPage={staffItemsPerPage}
          onPageChange={setStaffCurrentPage}
          onItemsPerPageChange={setStaffItemsPerPage}
          itemsPerPageOptions={[5, 10, 20, 50, 100]}
        />
      )}
      {!isLoading && activeTab === 'customer' && (
        <PhanTrang
          currentPage={customerCurrentPage}
          totalItems={filteredCustomerList.length}
          itemsPerPage={customerItemsPerPage}
          onPageChange={setCustomerCurrentPage}
          onItemsPerPageChange={setCustomerItemsPerPage}
          itemsPerPageOptions={[5, 10, 20, 50, 100]}
        />
      )}

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
              type="tel"
              inputMode="numeric"
              maxLength={10}
              placeholder="0xxxxxxxxx (10 số)"
              value={formStaff.phone}
              onChange={(e) => setFormStaff((s) => ({ ...s, phone: normalizePhoneInput(e.target.value) }))}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vai trò</label>
              <p className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm">
                {ROLE_LABELS[formStaff.role] ?? formStaff.role}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Vai trò không thể thay đổi</p>
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
              type="tel"
              value={formCustomer.soDienThoai}
              disabled
              className="bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
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
            type="tel"
            inputMode="numeric"
            maxLength={10}
            placeholder="0xxxxxxxxx (10 số)"
            value={formCreateStaff.phone}
            onChange={(e) => setFormCreateStaff((s) => ({ ...s, phone: normalizePhoneInput(e.target.value) }))}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vai trò *</label>
            <input
              type="text"
              readOnly
              value="Nhân viên"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Tạo mới chỉ được vai trò Nhân viên. Hệ thống chỉ có một Admin.</p>
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
            type="tel"
            inputMode="numeric"
            maxLength={10}
            placeholder="0xxxxxxxxx (10 số)"
            value={formCreateCustomer.soDienThoai}
            onChange={(e) => setFormCreateCustomer((s) => ({ ...s, soDienThoai: normalizePhoneInput(e.target.value) }))}
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
