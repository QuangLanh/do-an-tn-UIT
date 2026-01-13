/**
 * Products Page
 * Trang quản lý sản phẩm với CRUD operations
 */

import { useEffect, useState, useMemo } from 'react'
import { Plus, Search, Edit, Trash2 } from 'lucide-react'
import { NutBam } from '@/giao-dien/components/NutBam'
import { NhapLieu } from '@/giao-dien/components/NhapLieu'
import { BangDuLieu } from '@/giao-dien/components/BangDuLieu'
import { HuyHieu } from '@/giao-dien/components/HuyHieu'
import { HopThoai } from '@/giao-dien/components/HopThoai'
import { PhanTrang } from '@/giao-dien/components/PhanTrang'
import { DropdownTimKiem } from '@/giao-dien/components/DropdownTimKiem'
import { UploadAnh } from '@/giao-dien/components/UploadAnh'
import { Product, CreateProductDto } from '@/linh-vuc/products/entities/Product'
import { productApi } from '@/ha-tang/api/productApi'
import { useAuthStore } from '@/kho-trang-thai/khoXacThuc'
import { formatCurrency } from '@/ha-tang/utils/formatters'
import toast from 'react-hot-toast'

// --- 1. IMPORT REACT QUILL ---
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import giao diện soạn thảo
// -----------------------------

export const TrangSanPham = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isHopThoaiOpen, setIsHopThoaiOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
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
    // Reset về trang 1 khi tìm kiếm
    setCurrentPage(1)
  }, [searchQuery, products])

  // Tính toán dữ liệu phân trang
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredProducts.slice(startIndex, endIndex)
  }, [filteredProducts, currentPage, itemsPerPage])

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
    {
      header: 'Ảnh',
      accessor: (product: Product) => {
        const getImageUrl = (url?: string) => {
          if (!url) return '';
          if (url.startsWith('http')) return url;
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
          const cleanUrl = url.startsWith('/') ? url : `/${url}`;
          return `${apiUrl}${cleanUrl}`;
        };

        const finalUrl = getImageUrl(product.imageUrl);

        return (
          <div className="w-12 h-12 flex items-center justify-center">
            {finalUrl ? (
              <img
                src={finalUrl}
                alt={product.name}
                className="w-full h-full object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/50?text=IMG';
                  e.currentTarget.onerror = null;
                }}
              />
            ) : (
              <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <span className="text-[10px] text-gray-500">No img</span>
              </div>
            )}
          </div>
        );
      },
    },
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
            Tổng số: {filteredProducts.length} sản phẩm
          </p>
        </div>
        {hasPermission('create_product') && (
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
      <BangDuLieu data={paginatedProducts} columns={columns} />

      {/* Pagination */}
      {filteredProducts.length > 0 && (
        <PhanTrang
          currentPage={currentPage}
          totalItems={filteredProducts.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      )}

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
    imageUrl: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [allProducts, setAllProducts] = useState<Product[]>([])

  // Load products để lấy danh sách unique values
  useEffect(() => {
    if (isOpen) {
      productApi.getAllProducts.execute().then(setAllProducts).catch(() => {})
    }
  }, [isOpen])

  // Lấy danh sách unique values từ products
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(allProducts.map((p) => p.category).filter(Boolean)))
    return uniqueCategories.sort()
  }, [allProducts])

  const suppliers = useMemo(() => {
    const uniqueSuppliers = Array.from(new Set(allProducts.map((p) => p.supplier).filter(Boolean)))
    return uniqueSuppliers.sort()
  }, [allProducts])

  const units = useMemo(() => {
    const uniqueUnits = Array.from(new Set(allProducts.map((p) => p.unit).filter(Boolean)))
    return uniqueUnits.sort()
  }, [allProducts])

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
        imageUrl: product.imageUrl || '',
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
        imageUrl: '',
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

  // --- 2. CẤU HÌNH TOOLBAR CHO EDITOR ---
  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'clean'],
    ],
  };
  // --------------------------------------

  return (
    <HopThoai isOpen={isOpen} onClose={onClose} title={product ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Upload ảnh */}
        <UploadAnh
          label="Ảnh sản phẩm"
          value={formData.imageUrl}
          onChange={(value) => setFormData({ ...formData, imageUrl: value })}
        />

        <div className="grid grid-cols-2 gap-4">
          <NhapLieu
            label="Tên sản phẩm"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <DropdownTimKiem
            label="Danh mục"
            value={formData.category}
            onChange={(value) => setFormData({ ...formData, category: value })}
            options={categories}
            placeholder="Chọn hoặc tìm kiếm danh mục"
            required
            allowCustom={true}
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
          <DropdownTimKiem
            label="Đơn vị"
            value={formData.unit}
            onChange={(value) => setFormData({ ...formData, unit: value })}
            options={units}
            placeholder="Chọn hoặc tìm kiếm đơn vị"
            required
            allowCustom={true}
          />
        </div>

        <DropdownTimKiem
          label="Nhà cung cấp"
          value={formData.supplier}
          onChange={(value) => setFormData({ ...formData, supplier: value })}
          options={suppliers}
          placeholder="Chọn hoặc tìm kiếm nhà cung cấp"
          required
          allowCustom={true}
        />

        {/* --- 3. THAY THẾ TEXTAREA BẰNG REACT QUILL --- */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Mô tả sản phẩm
          </label>
          <div className="bg-white text-gray-900 rounded-lg overflow-hidden">
             {/* Lưu ý: ReactQuill cần nền trắng để hiển thị icon toolbar rõ ràng */}
            <ReactQuill
              theme="snow"
              value={formData.description}
              onChange={(value) => setFormData({ ...formData, description: value })}
              modules={quillModules}
              className="h-48 mb-12" // mb-12 để chừa chỗ cho thanh trạng thái của editor
            />
          </div>
        </div>
        {/* --------------------------------------------- */}

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