import { useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { NhapLieu } from '@/giao-dien/components/NhapLieu'
import { PhanTrang } from '@/giao-dien/components/PhanTrang'
import { TheThongTin } from '@/giao-dien/components/TheThongTin'
import { productApi } from '@/ha-tang/api/productApi'
import { Product } from '@/linh-vuc/products/entities/Product'
import { formatCurrency } from '@/ha-tang/utils/formatters'
import toast from 'react-hot-toast'

export const TrangSanPhamKhachHang = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)
  const [isLoading, setIsLoading] = useState(true)

  const loadProducts = async () => {
    try {
      setIsLoading(true)
      const data = await productApi.getAllProducts.execute()
      setProducts(Array.isArray(data) ? data : [])
    } catch (error) {
      toast.error('Không thể tải danh sách sản phẩm')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return products
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q),
    )
  }, [products, search])

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filtered.slice(start, start + itemsPerPage)
  }, [filtered, currentPage, itemsPerPage])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sản phẩm</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Xem và lựa chọn sản phẩm tại cửa hàng
        </p>
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <NhapLieu
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setCurrentPage(1)
              }}
              placeholder="Tìm kiếm theo tên hoặc danh mục..."
              className="pl-10"
            />
          </div>
          <TheThongTin title="Tổng sản phẩm">
            <div className="px-6 py-2 text-lg font-semibold">{filtered.length}</div>
          </TheThongTin>
        </div>
      </div>

      {isLoading ? (
        <div className="text-gray-500 dark:text-gray-400">Đang tải...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginated.map((p) => (
              <div
                key={p.id}
                className="border rounded-lg p-3 bg-white dark:bg-gray-800 shadow-sm flex flex-col gap-2"
              >
                <div className="w-full h-40 bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden flex items-center justify-center">
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-gray-500">No image</span>
                  )}
                </div>
                <div className="font-semibold text-gray-900 dark:text-white">{p.name}</div>
                <div className="text-sm text-gray-500">{p.category}</div>
                <div className="text-blue-600 dark:text-blue-300 font-bold">
                  {formatCurrency(p.salePrice)}
                </div>
                <div className="text-xs text-gray-500">Đơn vị: {p.unit || '-'}</div>
              </div>
            ))}
          </div>

          {filtered.length > itemsPerPage && (
            <PhanTrang
              currentPage={currentPage}
              totalItems={filtered.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
              itemsPerPageOptions={[8, 12, 24, 48]}
            />
          )}
        </>
      )}
    </div>
  )
}


