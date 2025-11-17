/**
 * Products Page
 * Trang quản lý sản phẩm với CRUD operations
 */

import { useEffect, useState } from 'react'
import { Plus, Search, Edit, Trash2 } from 'lucide-react'
import { NutBam } from '@/giao-dien/components/NutBam'
import { NhapLieu } from '@/giao-dien/components/NhapLieu'
import { BangDuLieu } from '@/giao-dien/components/BangDuLieu'
import { HuyHieu } from '@/giao-dien/components/HuyHieu'
import { HopThoai } from '@/giao-dien/components/HopThoai'
import { Product, CreateProductDto } from '@/linh-vuc/products/entities/Product'
import { productApi } from '@/ha-tang/api/productApi'
import { useAuthStore } from '@/kho-trang-thai/khoXacThuc'
import { formatCurrency } from '@/ha-tang/utils/formatters'
import toast from 'react-hot-toast'

export const TrangSanPham = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isHopThoaiOpen, setIsHopThoaiOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const { hasPermission } = useAuthStore()

  useEffect(() => {
    loadProducts()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      const filtered = products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.supplier.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredProducts(filtered)
    } else {
      setFilteredProducts(products)
    }
  }, [searchQuery, products])

  const loadProducts = async () => {
    try {
      const data = await productApi.getAllProducts.execute()
      setProducts(data)
      setFilteredProducts(data)
    } catch (error) {
      toast.error('Không thể tải danh sách sản phẩm')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!hasPermission('delete_product')) {
      toast.error('Bạn không có quyền xóa sản phẩm')
      return
    }

    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return

    try {
      await productApi.deleteProduct.execute(id)
      toast.success('Đã xóa sản phẩm thành công')
      loadProducts()
    } catch (error) {
      toast.error('Không thể xóa sản phẩm')
    }
  }

  const handleEdit = (product: Product) => {
    if (!hasPermission('edit_product')) {
      toast.error('Bạn không có quyền sửa sản phẩm')
      return
    }
    setEditingProduct(product)
    setIsHopThoaiOpen(true)
  }

  const handleCreate = () => {
    setEditingProduct(null)
    setIsHopThoaiOpen(true)
  }

  const getStockHuyHieu = (stock: number) => {
    if (stock === 0) return <HuyHieu variant="danger">Hết hàng</HuyHieu>
    if (stock < 5) return <HuyHieu variant="danger">Sắp hết ({stock})</HuyHieu>
    if (stock < 10) return <HuyHieu variant="warning">Thấp ({stock})</HuyHieu>
    return <HuyHieu variant="success">{stock}</HuyHieu>
  }

  const columns = [
    { header: 'Tên sản phẩm', accessor: 'name' as keyof Product },
    { header: 'Danh mục', accessor: 'category' as keyof Product },
    {
      header: 'Giá nhập',
      accessor: (product: Product) => formatCurrency(product.importPrice),
    },
    {
      header: 'Giá bán',
      accessor: (product: Product) => formatCurrency(product.salePrice),
    },
    {
      header: 'Tồn kho',
      accessor: (product: Product) => getStockHuyHieu(product.stock),
    },
    { header: 'Đơn vị', accessor: 'unit' as keyof Product },
    {
      header: 'Thao tác',
      accessor: (product: Product) => (
        <div className="flex space-x-2">
          {hasPermission('edit_product') && (
            <button
              onClick={() => handleEdit(product)}
              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded"
              title="Sửa"
            >
              <Edit size={16} />
            </button>
          )}
          {hasPermission('delete_product') && (
            <button
              onClick={() => handleDelete(product.id)}
              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded"
              title="Xóa"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      ),
    },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">Đang tải...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quản lý sản phẩm</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Tổng số: {products.length} sản phẩm
          </p>
        </div>
        {hasPermission('edit_product') && (
          <NutBam onClick={handleCreate}>
            <Plus size={20} className="mr-2" />
            Thêm sản phẩm
          </NutBam>
        )}
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search
            size={20}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <NhapLieu
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* BangDuLieu */}
      <BangDuLieu data={filteredProducts} columns={columns} />

      {/* HopThoai */}
      <ProductHopThoai
        isOpen={isHopThoaiOpen}
        onClose={() => {
          setIsHopThoaiOpen(false)
          setEditingProduct(null)
        }}
        product={editingProduct}
        onSuccess={loadProducts}
      />
    </div>
  )
}

// Product Form HopThoai Component
interface ProductHopThoaiProps {
  isOpen: boolean
  onClose: () => void
  product: Product | null
  onSuccess: () => void
}

const ProductHopThoai = ({ isOpen, onClose, product, onSuccess }: ProductHopThoaiProps) => {
  const [formData, setFormData] = useState<CreateProductDto>({
    name: '',
    category: '',
    importPrice: 0,
    salePrice: 0,
    stock: 0,
    unit: '',
    supplier: '',
    description: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        category: product.category,
        importPrice: product.importPrice,
        salePrice: product.salePrice,
        stock: product.stock,
        unit: product.unit,
        supplier: product.supplier,
        description: product.description,
      })
    } else {
      setFormData({
        name: '',
        category: '',
        importPrice: 0,
        salePrice: 0,
        stock: 0,
        unit: '',
        supplier: '',
        description: '',
      })
    }
  }, [product, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (product) {
        await productApi.updateProduct.execute(product.id, formData)
        toast.success('Cập nhật sản phẩm thành công')
      } else {
        await productApi.createProduct.execute(formData)
        toast.success('Thêm sản phẩm thành công')
      }
      onSuccess()
      onClose()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Có lỗi xảy ra')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <HopThoai isOpen={isOpen} onClose={onClose} title={product ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <NhapLieu
            label="Tên sản phẩm"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <NhapLieu
            label="Danh mục"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <NhapLieu
            label="Giá nhập"
            type="number"
            value={formData.importPrice}
            onChange={(e) => setFormData({ ...formData, importPrice: Number(e.target.value) })}
            required
            min={0}
          />
          <NhapLieu
            label="Giá bán"
            type="number"
            value={formData.salePrice}
            onChange={(e) => setFormData({ ...formData, salePrice: Number(e.target.value) })}
            required
            min={0}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <NhapLieu
            label="Tồn kho"
            type="number"
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
            required
            min={0}
          />
          <NhapLieu
            label="Đơn vị"
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            placeholder="kg, hộp, chai..."
            required
          />
        </div>

        <NhapLieu
          label="Nhà cung cấp"
          value={formData.supplier}
          onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Mô tả
          </label>
          <textarea
            className="input-field min-h-[80px]"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Mô tả sản phẩm..."
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <NutBam type="button" variant="secondary" onClick={onClose}>
            Hủy
          </NutBam>
          <NutBam type="submit" isLoading={isSubmitting}>
            {product ? 'Cập nhật' : 'Thêm mới'}
          </NutBam>
        </div>
      </form>
    </HopThoai>
  )
}

