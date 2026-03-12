import { useState } from 'react'
import { Database, Download, ShieldCheck } from 'lucide-react'
import { TheThongTin } from '@/giao-dien/components/TheThongTin'
import { NutBam } from '@/giao-dien/components/NutBam'
import { useAuthStore } from '@/kho-trang-thai/khoXacThuc'
import toast from 'react-hot-toast'

export const TrangSaoDuLieu = () => {
  const [isBackingUp, setIsBackingUp] = useState(false)
  const { token } = useAuthStore()

  const handleBackup = async () => {
    try {
      setIsBackingUp(true)
      toast.loading('Đang tạo file backup...', { id: 'backup' })

      const apiBase = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:4000'
      const baseUrl = apiBase.endsWith('/api') ? apiBase : `${apiBase.replace(/\/$/, '')}/api`
      const response = await fetch(`${baseUrl}/reports/backup`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Lỗi ${response.status}: ${response.statusText}`)
      }

      const contentDisposition = response.headers.get('content-disposition') || ''
      const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/)
      const filename = filenameMatch ? filenameMatch[1] : `backup-${new Date().toISOString().slice(0, 10)}.json`

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success(`Đã tải xuống file backup: ${filename}`, { id: 'backup' })
    } catch (error: any) {
      toast.error(`Không thể backup: ${error.message}`, { id: 'backup' })
    } finally {
      setIsBackingUp(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <Database size={28} /> Sao lưu dữ liệu
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Tải xuống bản sao lưu toàn bộ dữ liệu hệ thống
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TheThongTin title="Sao lưu database">
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <ShieldCheck size={20} className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <p className="font-medium mb-1">Nội dung backup bao gồm:</p>
                <ul className="list-disc list-inside space-y-0.5 text-blue-600 dark:text-blue-400">
                  <li>Tất cả sản phẩm</li>
                  <li>Lịch sử đơn hàng</li>
                  <li>Phiếu nhập hàng</li>
                </ul>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400">
              File backup sẽ được tải xuống dưới dạng <strong>.json</strong>.
              Nên thực hiện backup định kỳ để bảo vệ dữ liệu.
            </p>

            <NutBam
              onClick={handleBackup}
              isLoading={isBackingUp}
              className="w-full"
            >
              <Download size={18} className="mr-2" />
              {isBackingUp ? 'Đang tạo backup...' : 'Backup Database'}
            </NutBam>
          </div>
        </TheThongTin>

        <TheThongTin title="Hướng dẫn">
          <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
            <div className="flex items-start gap-2">
              <span className="font-bold text-primary-600 dark:text-primary-400 flex-shrink-0">1.</span>
              <p>Bấm nút <strong>Backup Database</strong> để bắt đầu quá trình tạo file backup.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-primary-600 dark:text-primary-400 flex-shrink-0">2.</span>
              <p>File <strong>.json</strong> sẽ tự động được tải xuống máy tính của bạn.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-primary-600 dark:text-primary-400 flex-shrink-0">3.</span>
              <p>Lưu file ở nơi an toàn. Nên backup ít nhất <strong>1 lần/tuần</strong>.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-primary-600 dark:text-primary-400 flex-shrink-0">4.</span>
              <p>File backup chứa toàn bộ dữ liệu sản phẩm, đơn hàng và phiếu nhập.</p>
            </div>
          </div>
        </TheThongTin>
      </div>
    </div>
  )
}
