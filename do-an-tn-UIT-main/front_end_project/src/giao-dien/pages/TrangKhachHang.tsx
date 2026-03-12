import { useEffect, useState } from 'react'
import { Users, RefreshCw, Star, TrendingUp, User } from 'lucide-react'
import { TheThongTin } from '@/giao-dien/components/TheThongTin'
import { TheThongKe } from '@/giao-dien/components/TheThongKe'
import { NutBam } from '@/giao-dien/components/NutBam'
import { HuyHieu } from '@/giao-dien/components/HuyHieu'
import { formatCurrency } from '@/ha-tang/utils/formatters'
import { apiClient } from '@/ha-tang/api/index'
import toast from 'react-hot-toast'

interface KhachHang {
  _id: string
  soDienThoai: string
  ten?: string
  email?: string
  diaChi?: string
  loaiKhachHang: 'thuong' | 'tiem-nang' | 'vip'
  tongChiTieu: number
  soLanMua: number
  isActive: boolean
  createdAt: string
}

const LOAI_LABEL: Record<string, string> = {
  vip: 'VIP',
  'tiem-nang': 'Tiềm năng',
  thuong: 'Thường',
}

const LOAI_BADGE: Record<string, 'success' | 'warning' | 'default'> = {
  vip: 'success',
  'tiem-nang': 'warning',
  thuong: 'default',
}

export const TrangKhachHang = () => {
  const [customers, setCustomers] = useState<KhachHang[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isClassifying, setIsClassifying] = useState(false)
  const [search, setSearch] = useState('')

  const loadCustomers = async () => {
    try {
      setIsLoading(true)
      const res = await apiClient.get('/customers')
      setCustomers(res.data || [])
    } catch {
      toast.error('Không thể tải danh sách khách hàng')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClassify = async () => {
    try {
      setIsClassifying(true)
      const res = await apiClient.post('/customers/classify', {})
      toast.success(res.data.message || 'Đã phân loại xong')
      await loadCustomers()
    } catch {
      toast.error('Không thể phân loại khách hàng')
    } finally {
      setIsClassifying(false)
    }
  }

  useEffect(() => {
    loadCustomers()
  }, [])

  const filtered = customers.filter((c) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      (c.ten || '').toLowerCase().includes(q) ||
      c.soDienThoai.includes(q)
    )
  })

  const vipCount = customers.filter((c) => c.loaiKhachHang === 'vip').length
  const tiemNangCount = customers.filter((c) => c.loaiKhachHang === 'tiem-nang').length
  const thuongCount = customers.filter((c) => c.loaiKhachHang === 'thuong').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Users size={28} /> Quản lý khách hàng
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Xem và phân loại khách hàng theo giá trị mua hàng
          </p>
        </div>
        <div className="flex gap-2">
          <NutBam variant="secondary" onClick={loadCustomers} isLoading={isLoading}>
            <RefreshCw size={16} className="mr-2" /> Làm mới
          </NutBam>
          <NutBam onClick={handleClassify} isLoading={isClassifying}>
            <Star size={16} className="mr-2" /> Phân loại khách hàng
          </NutBam>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <TheThongKe title="Tổng khách hàng" value={customers.length} icon={Users} color="blue" />
        <TheThongKe title="Khách VIP" value={vipCount} icon={Star} color="green" />
        <TheThongKe title="Khách tiềm năng" value={tiemNangCount} icon={TrendingUp} color="yellow" />
        <TheThongKe title="Khách thường" value={thuongCount} icon={User} color="purple" />
      </div>

      <TheThongTin title="Danh sách khách hàng">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Tìm theo tên hoặc số điện thoại..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-sm px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">Đang tải...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            Chưa có khách hàng nào. Hãy bấm "Phân loại khách hàng" để đồng bộ từ đơn hàng.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-3 font-semibold text-gray-700 dark:text-gray-300">Tên khách hàng</th>
                  <th className="text-left py-3 px-3 font-semibold text-gray-700 dark:text-gray-300">Số điện thoại</th>
                  <th className="text-left py-3 px-3 font-semibold text-gray-700 dark:text-gray-300">Loại khách</th>
                  <th className="text-right py-3 px-3 font-semibold text-gray-700 dark:text-gray-300">Tổng chi tiêu</th>
                  <th className="text-right py-3 px-3 font-semibold text-gray-700 dark:text-gray-300">Số lần mua</th>
                  <th className="text-left py-3 px-3 font-semibold text-gray-700 dark:text-gray-300">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filtered.map((c) => (
                  <tr key={c._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="py-3 px-3 font-medium text-gray-900 dark:text-white">
                      {c.ten || '(Chưa có tên)'}
                    </td>
                    <td className="py-3 px-3 text-gray-600 dark:text-gray-400">{c.soDienThoai}</td>
                    <td className="py-3 px-3">
                      <HuyHieu variant={LOAI_BADGE[c.loaiKhachHang] || 'default'}>
                        {c.loaiKhachHang === 'vip' && '⭐ '}
                        {LOAI_LABEL[c.loaiKhachHang] || c.loaiKhachHang}
                      </HuyHieu>
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(c.tongChiTieu || 0)}
                    </td>
                    <td className="py-3 px-3 text-right text-gray-600 dark:text-gray-400">
                      {c.soLanMua || 0}
                    </td>
                    <td className="py-3 px-3">
                      <HuyHieu variant={c.isActive ? 'success' : 'danger'}>
                        {c.isActive ? 'Hoạt động' : 'Tạm khóa'}
                      </HuyHieu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-700 dark:text-blue-300">
          <strong>Tiêu chí phân loại:</strong> VIP (chi tiêu ≥ 2,000,000đ) · Tiềm năng (500,000đ - 2,000,000đ) · Thường (dưới 500,000đ)
        </div>
      </TheThongTin>
    </div>
  )
}
