import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { BangDuLieu } from '@/giao-dien/components/BangDuLieu'
import { TheThongTin } from '@/giao-dien/components/TheThongTin'
import { HuyHieu } from '@/giao-dien/components/HuyHieu'
import { apiService } from '@/ha-tang/api'
import { formatCurrency, formatDateTime } from '@/ha-tang/utils/formatters'

type OrderHistoryItem = {
  _id: string
  orderNumber?: string
  totalAmount?: number
  status?: string
  createdAt?: string
  items?: Array<{ product?: { name?: string }; quantity?: number }>
}

export const TrangLichSuMuaHang = () => {
  const [orders, setOrders] = useState<OrderHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const taiLichSu = async () => {
    try {
      setIsLoading(true)
      const data = await apiService.orders.history()
      setOrders(Array.isArray(data) ? data : [])
    } catch (error) {
      toast.error('Không thể tải lịch sử mua hàng')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    taiLichSu()
  }, [])

  const tongDon = orders.length
  const tongTien = useMemo(
    () => orders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0),
    [orders],
  )

  const data = useMemo(
    () =>
      orders.map((o) => ({
        id: o._id || o.orderNumber || crypto.randomUUID(),
        orderNumber: o.orderNumber,
        createdAt: o.createdAt,
        status: o.status,
        totalAmount: o.totalAmount,
        itemCount: o.items?.length || 0,
      })),
    [orders],
  )

  const columns = [
    {
      header: 'Mã đơn',
      accessor: (o: any) => o.orderNumber || o.id,
    },
    {
      header: 'Thời gian',
      accessor: (o: any) => formatDateTime(new Date(o.createdAt || Date.now())),
    },
    {
      header: 'Trạng thái',
      accessor: (o: any) => (
        <HuyHieu variant={o.status === 'COMPLETED' ? 'success' : 'warning'}>
          {o.status || 'Chờ xử lý'}
        </HuyHieu>
      ),
    },
    {
      header: 'Tổng tiền',
      accessor: (o: any) => formatCurrency(o.totalAmount || 0),
    },
    {
      header: 'Số mặt hàng',
      accessor: (o: any) => o.itemCount || 0,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Lịch sử mua hàng</h1>
        <p className="text-gray-600 dark:text-gray-400">Theo dõi các đơn đã mua tại cửa hàng</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TheThongTin title="Số đơn hàng">
          <div className="text-2xl font-semibold">{tongDon}</div>
        </TheThongTin>
        <TheThongTin title="Tổng giá trị">
          <div className="text-2xl font-semibold text-blue-600 dark:text-blue-300">
            {formatCurrency(tongTien)}
          </div>
        </TheThongTin>
      </div>

      {isLoading ? (
        <div className="text-gray-500 dark:text-gray-400">Đang tải...</div>
      ) : (
        <BangDuLieu data={data} columns={columns} />
      )}
    </div>
  )
}


