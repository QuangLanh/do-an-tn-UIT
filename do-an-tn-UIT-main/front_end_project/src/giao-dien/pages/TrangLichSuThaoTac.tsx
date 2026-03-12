import { useEffect, useState } from 'react'
import { History, RefreshCw } from 'lucide-react'
import { TheThongTin } from '@/giao-dien/components/TheThongTin'
import { NutBam } from '@/giao-dien/components/NutBam'
import { apiClient } from '@/ha-tang/api/index'
import toast from 'react-hot-toast'

interface LogEntry {
  _id: string
  userId?: string
  userFullName: string
  action: string
  entityType: string
  entityId?: string
  entityName?: string
  details?: string
  createdAt: string
}

const ENTITY_TYPE_LABELS: Record<string, string> = {
  purchase: 'Phiếu nhập hàng',
  product: 'Sản phẩm',
  order: 'Đơn hàng',
  supplier: 'Nhà cung cấp',
  customer: 'Khách hàng',
  user: 'Tài khoản',
}

const ACTION_COLORS: Record<string, string> = {
  'Tạo phiếu nhập hàng': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  'Xóa phiếu nhập hàng': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  'Cập nhật sản phẩm': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  'Tạo sản phẩm': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  'Xóa sản phẩm': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
}

export const TrangLichSuThaoTac = () => {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [entityTypeFilter, setEntityTypeFilter] = useState('')
  const limit = 20

  const loadLogs = async (p = page) => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({ page: String(p), limit: String(limit) })
      if (entityTypeFilter) params.append('entityType', entityTypeFilter)
      const res = await apiClient.get(`/audit-logs?${params}`)
      const data = res.data
      setLogs(data.data || [])
      setTotal(data.total || 0)
    } catch {
      toast.error('Không thể tải lịch sử thao tác')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadLogs(1)
    setPage(1)
  }, [entityTypeFilter])

  const totalPages = Math.ceil(total / limit)

  const getActionColor = (action: string) =>
    ACTION_COLORS[action] || ACTION_COLORS.default

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <History size={28} /> Lịch sử thao tác
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Theo dõi các thao tác quan trọng trong hệ thống
          </p>
        </div>
        <NutBam variant="secondary" onClick={() => loadLogs(page)} isLoading={isLoading}>
          <RefreshCw size={16} className="mr-2" /> Làm mới
        </NutBam>
      </div>

      <TheThongTin>
        <div className="flex flex-wrap gap-3 mb-4">
          <select
            value={entityTypeFilter}
            onChange={(e) => setEntityTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Tất cả loại đối tượng</option>
            {Object.entries(ENTITY_TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <span className="text-sm text-gray-500 dark:text-gray-400 self-center">
            Tổng: {total} bản ghi
          </span>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">Đang tải...</div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            Chưa có lịch sử thao tác nào
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-3 font-semibold text-gray-700 dark:text-gray-300">Thời gian</th>
                    <th className="text-left py-3 px-3 font-semibold text-gray-700 dark:text-gray-300">Người thực hiện</th>
                    <th className="text-left py-3 px-3 font-semibold text-gray-700 dark:text-gray-300">Hành động</th>
                    <th className="text-left py-3 px-3 font-semibold text-gray-700 dark:text-gray-300">Loại đối tượng</th>
                    <th className="text-left py-3 px-3 font-semibold text-gray-700 dark:text-gray-300">Tên đối tượng</th>
                    <th className="text-left py-3 px-3 font-semibold text-gray-700 dark:text-gray-300">Chi tiết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {logs.map((log) => (
                    <tr key={log._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="py-3 px-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString('vi-VN')}
                      </td>
                      <td className="py-3 px-3 font-medium text-gray-900 dark:text-white">
                        {log.userFullName}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-gray-600 dark:text-gray-400">
                        {ENTITY_TYPE_LABELS[log.entityType] || log.entityType}
                      </td>
                      <td className="py-3 px-3 text-gray-900 dark:text-white">
                        {log.entityName || '—'}
                      </td>
                      <td className="py-3 px-3 text-gray-500 dark:text-gray-400 max-w-xs truncate">
                        {log.details || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Trang {page} / {totalPages}
                </span>
                <div className="flex gap-2">
                  <NutBam
                    size="sm"
                    variant="secondary"
                    onClick={() => { setPage(p => p - 1); loadLogs(page - 1) }}
                    disabled={page <= 1}
                  >
                    Trước
                  </NutBam>
                  <NutBam
                    size="sm"
                    variant="secondary"
                    onClick={() => { setPage(p => p + 1); loadLogs(page + 1) }}
                    disabled={page >= totalPages}
                  >
                    Sau
                  </NutBam>
                </div>
              </div>
            )}
          </>
        )}
      </TheThongTin>
    </div>
  )
}
