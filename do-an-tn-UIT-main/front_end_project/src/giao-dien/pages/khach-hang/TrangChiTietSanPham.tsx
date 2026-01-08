import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { NutBam } from '@/giao-dien/components/NutBam'
import { TheThongTin } from '@/giao-dien/components/TheThongTin'
import { formatCurrency } from '@/ha-tang/utils/formatters'
import { apiService } from '@/ha-tang/api'

export const TrangChiTietSanPham = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true)
        const p = await apiService.products.detail(String(id))
        setProduct(p)
      } catch (e) {
        toast.error('Không thể tải chi tiết sản phẩm')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [id])

  const themVaoDanhSachMua = async () => {
    try {
      const active = await apiService.shoppingLists.active()
      const currentItems: Array<{ productId: string; quantity: number }> =
        (active as any)?.items?.map((i: any) => ({
          productId: String(i.productId?._id || i.productId?.id || i.productId),
          quantity: Number(i.quantity || 1),
        })) || []

      const pid = String(product?._id || product?.id || id)
      const idx = currentItems.findIndex((i) => i.productId === pid)
      if (idx >= 0) currentItems[idx].quantity += 1
      else currentItems.push({ productId: pid, quantity: 1 })

      await apiService.shoppingLists.create({ items: currentItems })
      toast.success('Đã thêm vào danh sách mua')
      navigate('/khach-hang/danh-sach-mua')
    } catch (e) {
      toast.error('Không thể thêm vào danh sách mua')
    }
  }

  if (isLoading) {
    return <div className="text-center text-gray-600 dark:text-gray-400">Đang tải...</div>
  }

  if (!product) {
    return (
      <div className="text-center text-gray-600 dark:text-gray-400">
        Không tìm thấy sản phẩm
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <TheThongTin title="Chi tiết sản phẩm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Ảnh sản phẩm */}
          <div className="w-full">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-96 object-cover rounded-xl border border-gray-200 dark:border-gray-700"
              />
            ) : (
              <div className="w-full h-96 bg-gray-100 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                <span className="text-gray-400 dark:text-gray-500">Chưa có ảnh</span>
              </div>
            )}
          </div>

          {/* Thông tin sản phẩm */}
          <div className="space-y-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {product.name}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">{product.category}</p>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-4">
                {formatCurrency(product.salePrice)}
              </p>
            </div>

            {product.description && (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Mô tả sản phẩm
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-3">
                <NutBam variant="secondary" onClick={() => navigate(-1)} className="flex-1">
                  Quay lại
                </NutBam>
                <NutBam onClick={themVaoDanhSachMua} className="flex-1">
                  Thêm vào danh sách mua
                </NutBam>
              </div>
            </div>
          </div>
        </div>
      </TheThongTin>
    </div>
  )
}


