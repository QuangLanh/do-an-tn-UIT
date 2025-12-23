import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { NutBam } from '@/giao-dien/components/NutBam'
import { TheThongTin } from '@/giao-dien/components/TheThongTin'
import { BangDuLieu } from '@/giao-dien/components/BangDuLieu'
import { formatCurrency } from '@/ha-tang/utils/formatters'
import { apiService } from '@/ha-tang/api'

export const TrangDanhSachMuaHang = () => {
  const [danhSach, setDanhSach] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  const taiDanhSach = async () => {
    try {
      setIsLoading(true)
      const active = await apiService.shoppingLists.active()
      setDanhSach(active || null)
    } catch (e) {
      toast.error('Không thể tải danh sách mua')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    taiDanhSach()
  }, [])

  const items = useMemo(() => {
    const raw = danhSach?.items || []
    return raw.map((i: any) => {
      const p = i.productId && typeof i.productId === 'object' ? i.productId : null
      return {
        productId: String(p?._id || i.productId),
        ten: p?.name || 'Sản phẩm',
        gia: Number(p?.salePrice || 0),
        donVi: p?.unit || '',
        quantity: Number(i.quantity || 1),
        thanhTien: Number(p?.salePrice || 0) * Number(i.quantity || 1),
      }
    })
  }, [danhSach])

  const capNhatSoLuong = async (productId: string, quantity: number) => {
    if (!danhSach?._id) return
    if (quantity < 1) return
    try {
      const newItems = items.map((i: any) => (i.productId === productId ? { ...i, quantity } : i))
      await apiService.shoppingLists.update(String(danhSach._id), {
        items: newItems.map((i: any) => ({ productId: i.productId, quantity: i.quantity })),
      })
      await taiDanhSach()
      toast.success('Đã cập nhật')
    } catch (e) {
      toast.error('Không thể cập nhật danh sách')
    }
  }

  const xoaSanPham = async (productId: string) => {
    if (!danhSach?._id) return
    try {
      const newItems = items.filter((i: any) => i.productId !== productId)
      await apiService.shoppingLists.update(String(danhSach._id), {
        items: newItems.map((i: any) => ({ productId: i.productId, quantity: i.quantity })),
      })
      await taiDanhSach()
      toast.success('Đã xoá sản phẩm')
    } catch (e) {
      toast.error('Không thể xoá sản phẩm')
    }
  }

  const hoanThanh = async () => {
    if (!danhSach?._id) return
    try {
      await apiService.shoppingLists.complete(String(danhSach._id))
      toast.success('Đã đánh dấu hoàn thành')
      await taiDanhSach()
    } catch (e) {
      toast.error('Không thể hoàn thành danh sách')
    }
  }

  const xoaDanhSach = async () => {
    if (!danhSach?._id) return
    try {
      await apiService.shoppingLists.delete(String(danhSach._id))
      toast.success('Đã xoá danh sách')
      setDanhSach(null)
    } catch (e) {
      toast.error('Không thể xoá danh sách')
    }
  }

  const tongTien = items.reduce((sum: number, i: any) => sum + i.thanhTien, 0)

  if (isLoading) {
    return <div className="text-center text-gray-600 dark:text-gray-400">Đang tải...</div>
  }

  if (!danhSach || items.length === 0) {
    return (
      <TheThongTin title="Danh sách mua hàng">
        <p className="text-gray-600 dark:text-gray-400">
          Chưa có danh sách mua hàng. Bạn hãy thêm sản phẩm từ trang Sản phẩm.
        </p>
      </TheThongTin>
    )
  }

  return (
    <div className="space-y-4">
      <TheThongTin
        title="Danh sách mua hàng"
        action={
          <div className="flex gap-2">
            <NutBam variant="secondary" onClick={hoanThanh}>
              Đánh dấu hoàn thành
            </NutBam>
            <NutBam variant="danger" onClick={xoaDanhSach}>
              Xoá danh sách
            </NutBam>
          </div>
        }
      >
        <BangDuLieu
          data={items}
          columns={[
            { header: 'Sản phẩm', accessor: 'ten' as any },
            {
              header: 'Giá',
              accessor: (row: any) => <span>{formatCurrency(row.gia)}</span>,
            },
            {
              header: 'Số lượng',
              accessor: (row: any) => (
                <div className="flex items-center gap-2">
                  <NutBam size="sm" variant="secondary" onClick={() => capNhatSoLuong(row.productId, row.quantity - 1)}>
                    -
                  </NutBam>
                  <span className="w-10 text-center">{row.quantity}</span>
                  <NutBam size="sm" variant="secondary" onClick={() => capNhatSoLuong(row.productId, row.quantity + 1)}>
                    +
                  </NutBam>
                </div>
              ),
            },
            {
              header: 'Thành tiền',
              accessor: (row: any) => <span className="font-semibold">{formatCurrency(row.thanhTien)}</span>,
            },
            {
              header: 'Thao tác',
              accessor: (row: any) => (
                <NutBam size="sm" variant="danger" onClick={() => xoaSanPham(row.productId)}>
                  Xoá
                </NutBam>
              ),
            },
          ]}
        />

        <div className="mt-4 flex justify-end">
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            Tổng: {formatCurrency(tongTien)}
          </p>
        </div>
      </TheThongTin>
    </div>
  )
}


