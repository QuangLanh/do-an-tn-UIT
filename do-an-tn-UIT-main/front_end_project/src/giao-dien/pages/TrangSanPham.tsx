/**
 * Products Page
 * Trang quản lý sản phẩm với CRUD operations
 */

import { useEffect, useState, useMemo, useRef } from 'react'
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react'
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
import { supplierApi } from '@/ha-tang/api/supplierApi'
import { useAuthStore } from '@/kho-trang-thai/khoXacThuc'
import { formatCurrency } from '@/ha-tang/utils/formatters'
import toast from 'react-hot-toast'

// --- IMPORT REACT QUILL ---
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
// -----------------------------

export const TrangSanPham = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  // State cho Modal Thêm/Sửa
  const [isHopThoaiOpen, setIsHopThoaiOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  // State cho Modal Xem Chi Tiết
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const { user } = useAuthStore();

  // ========================================================================
  // 🔥 FIX LỖI QUYỀN ADMIN (CHẤP NHẬN CẢ HOA LẪN THƯỜNG)
  // ========================================================================
  const isAdmin = useMemo(() => {
    const role = String((user as any)?.role || '').trim().toUpperCase()
    return role === 'ADMIN' || role === 'QUAN_TRI_VIEN' || role === 'ROOT'
  }, [user])
  // ========================================================================

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
    setCurrentPage(1)
  }, [searchQuery, products])

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

  // Hàm mở xem chi tiết
  const handleViewDetail = (product: Product) => {
    setViewingProduct(product)
    setIsViewModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!isAdmin) {
      toast.error('Bạn không có quyền xóa sản phẩm (Cần quyền ADMIN)')
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
    if (!isAdmin) {
      toast.error('Bạn không có quyền sửa sản phẩm (Cần quyền ADMIN)')
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
      // Chỉ Admin mới thấy giá nhập, nhân viên thấy ***
      accessor: (product: Product) => isAdmin ? formatCurrency(product.importPrice) : '***',
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
          {/* Nút Xem chi tiết - Ai cũng thấy */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleViewDetail(product)
            }}
            className="p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 rounded"
            title="Xem chi tiết"
          >
            <Eye size={16} />
          </button>

          {/* Nút Sửa - Chỉ Admin thấy */}
          {isAdmin && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleEdit(product)
              }}
              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded"
              title="Sửa"
            >
              <Edit size={16} />
            </button>
          )}

          {/* Nút Xóa - Chỉ Admin thấy */}
          {isAdmin && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleDelete(product.id)
              }}
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
        {isAdmin && ( // Chỉ Admin mới có nút Thêm mới
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
      <BangDuLieu
        data={paginatedProducts}
        columns={columns}
        onRowClick={(product) => handleViewDetail(product)} // Bấm vào dòng là xem
      />

      {/* Pagination - Separate section below table */}
      {filteredProducts.length > 0 && (
        <div className="px-6">
          <PhanTrang
            currentPage={currentPage}
            totalItems={filteredProducts.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
            itemsPerPageOptions={[10, 20, 50, 100]}
          />
        </div>
      )}

      {/* HopThoai (Create/Edit) */}
      <ProductHopThoai
        key={editingProduct ? editingProduct.id : 'create-new'}
        isOpen={isHopThoaiOpen}
        onClose={() => {
          setIsHopThoaiOpen(false)
          setEditingProduct(null)
        }}
        product={editingProduct}
        products={products}
        onSuccess={loadProducts}
      />

      {/* HopThoai (View Detail) */}
      <ProductDetailModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        product={viewingProduct}
        onEdit={(p: Product) => {
            setIsViewModalOpen(false)
            handleEdit(p)
        }}
        canEdit={isAdmin}
      />
    </div>
  )
}

// --- Component 1: Product Form HopThoai (Giữ nguyên) ---
interface ProductHopThoaiProps {
  isOpen: boolean
  onClose: () => void
  product: Product | null
  products: Product[]
  onSuccess: () => void
}

const emptyFormData: CreateProductDto = {
  name: '', barcode: '', category: '', importPrice: 0, salePrice: 0, stock: 0,
  unit: '', supplier: '', description: '', imageUrl: '',
}

const ProductHopThoai = ({ isOpen, onClose, product, products, onSuccess }: ProductHopThoaiProps) => {
  const [formData, setFormData] = useState<CreateProductDto>(emptyFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [suppliersFromApi, setSuppliersFromApi] = useState<{ name: string }[]>([])
  const [barcodeInput, setBarcodeInput] = useState('')
  const [isCheckingBarcode, setIsCheckingBarcode] = useState(false)
  const barcodeInputRef = useRef<HTMLInputElement | null>(null)

  // Reset form khi mở modal hoặc chuyển thêm mới / sửa (dùng product?.id tránh re-run do object reference thay đổi)
  useEffect(() => {
    if (isOpen) {
      if (product) {
        setFormData({
          name: product.name || '', barcode: product.barcode || '', category: product.category || '',
          importPrice: product.importPrice || 0, salePrice: product.salePrice || 0, stock: product.stock || 0,
          unit: product.unit || '', supplier: product.supplier || '', description: product.description || '',
          imageUrl: product.imageUrl || '',
        })
        setBarcodeInput(product.barcode || '')
      } else {
        setFormData({ ...emptyFormData })
        setBarcodeInput('')
      }
    }
  }, [isOpen, product?.id])

  // Chỉ gọi API suppliers khi mở modal (products đã có từ parent)
  useEffect(() => {
    if (isOpen) {
      supplierApi.getAll.execute().then((data: any) => {
        setSuppliersFromApi(Array.isArray(data) ? data : [])
      }).catch(() => setSuppliersFromApi([]))
    }
  }, [isOpen])

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(products.map((p) => p.category).filter(Boolean)))
    return uniqueCategories.sort()
  }, [products])

  const suppliers = useMemo(() => {
    const fromApi = suppliersFromApi.map((s: any) => s.name || s.code || '').filter(Boolean)
    const fromProducts = Array.from(new Set(products.map((p) => p.supplier).filter(Boolean)))
    return [...new Set([...fromApi, ...fromProducts])].sort()
  }, [suppliersFromApi, products])

  const units = useMemo(() => {
    const uniqueUnits = Array.from(new Set(products.map((p) => p.unit).filter(Boolean)))
    return uniqueUnits.sort()
  }, [products])

  const handleBarcodeScan = async () => {
    const code = barcodeInput.trim()
    if (!code) return

    setIsCheckingBarcode(true)
    try {
      const existingProduct = await productApi.service.getProductByBarcode(code)
      if (existingProduct) {
        setFormData({
          name: existingProduct.name,
          category: existingProduct.category,
          importPrice: existingProduct.importPrice,
          salePrice: existingProduct.salePrice,
          stock: existingProduct.stock,
          unit: existingProduct.unit,
          supplier: existingProduct.supplier,
          description: existingProduct.description || '',
          imageUrl: existingProduct.imageUrl || '',
          barcode: code,
        })
        toast.success(`Đã tìm thấy sản phẩm: ${existingProduct.name}`)
      } else {
        setFormData((prev) => ({ ...prev, barcode: code }))
        toast('Chưa tìm thấy sản phẩm với barcode này. Vui lòng điền thông tin sản phẩm.')
        // Focus vào trường tên sản phẩm
        setTimeout(() => {
          const nameInput = document.querySelector<HTMLInputElement>('input[name="name"]')
          nameInput?.focus()
        }, 100)
      }
    } catch (error) {
      setFormData((prev) => ({ ...prev, barcode: code }))
      toast('Chưa tìm thấy sản phẩm với barcode này. Vui lòng điền thông tin sản phẩm.')
    } finally {
      setIsCheckingBarcode(false)
    }
  }

  useEffect(() => {
    const code = barcodeInput.trim()
    if (!code) return
    if (product && code === product.barcode) return

    const looksLikeBarcode = /^\d{8,}$/.test(code)
    if (!looksLikeBarcode) return

    const timeoutId = setTimeout(() => {
      handleBarcodeScan()
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [barcodeInput])

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

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'clean'],
    ],
  };

  return (
    <HopThoai isOpen={isOpen} onClose={onClose} title={product ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <UploadAnh
          label="Ảnh sản phẩm"
          value={formData.imageUrl}
          onChange={(value) => setFormData({ ...formData, imageUrl: value })}
        />

        <div className="space-y-2">
          <NhapLieu
            ref={barcodeInputRef}
            label="Barcode / Mã vạch"
            type="text"
            inputMode="numeric"
            placeholder="Quét hoặc nhập barcode..."
            value={barcodeInput}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, '')
              setBarcodeInput(value)
              setFormData({ ...formData, barcode: value })
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleBarcodeScan()
              }
            }}
          />
          <div className="flex gap-2">
            <NutBam
              type="button"
              variant="secondary"
              onClick={handleBarcodeScan}
              isLoading={isCheckingBarcode}
              className="text-sm"
            >
              Tìm sản phẩm
            </NutBam>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <NhapLieu
            label="Tên sản phẩm"
            name="name"
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

        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Mô tả sản phẩm
          </label>
          <div className="bg-white text-gray-900 rounded-lg overflow-hidden">
            <ReactQuill
              theme="snow"
              value={formData.description}
              onChange={(value) => setFormData({ ...formData, description: value })}
              modules={quillModules}
              className="h-48 mb-12"
            />
          </div>
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

// --- Component 2: Modal Xem Chi Tiết ---
interface ProductDetailModalProps {
  isOpen: boolean
  onClose: () => void
  product: Product | null
  onEdit: (product: Product) => void
  canEdit: boolean
}

const ProductDetailModal = ({ isOpen, onClose, product, onEdit, canEdit }: ProductDetailModalProps) => {
  if (!product) return null

  // Helper xử lý ảnh
  const getImageUrl = (url?: string) => {
    if (!url) return 'https://via.placeholder.com/300?text=No+Image';
    if (url.startsWith('http')) return url;
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    return `${apiUrl}${cleanUrl}`;
  };

  return (
    <HopThoai isOpen={isOpen} onClose={onClose} title="Chi tiết sản phẩm" size="lg">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Cột Trái: Ảnh */}
          <div className="w-full md:w-1/3">
            <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 flex items-center justify-center">
              <img
                src={getImageUrl(product.imageUrl)}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/300?text=Error';
                }}
              />
            </div>
            <div className="mt-4 text-center">
                <div className="text-sm text-gray-500">Barcode</div>
                <div className="font-mono font-bold text-lg tracking-wider">{product.barcode || '---'}</div>
            </div>
          </div>

          {/* Cột Phải: Thông tin */}
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{product.name}</h3>
              <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {product.category}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-100 dark:border-gray-700">
              <div>
                <label className="text-sm text-gray-500">Giá bán</label>
                <div className="text-xl font-bold text-blue-600">{formatCurrency(product.salePrice)}</div>
              </div>
              {/* Chỉ hiện giá nhập nếu có quyền sửa (Admin) */}
              {canEdit && (
                <div>
                    <label className="text-sm text-gray-500">Giá nhập</label>
                    <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                    {formatCurrency(product.importPrice)}
                    </div>
                </div>
              )}

              <div>
                <label className="text-sm text-gray-500">Tồn kho</label>
                <div className={`text-lg font-bold ${product.stock < 10 ? 'text-red-600' : 'text-green-600'}`}>
                  {product.stock} {product.unit}
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-500">Nhà cung cấp</label>
                <div className="text-lg font-medium">{product.supplier || '---'}</div>
              </div>
            </div>

            {/* Mô tả HTML */}
            <div>
              <label className="text-sm font-semibold text-gray-900 dark:text-white mb-2 block">Mô tả</label>
              <div
                className="prose dark:prose-invert max-w-none text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg max-h-48 overflow-y-auto"
                dangerouslySetInnerHTML={{ __html: product.description || '<p>Không có mô tả</p>' }}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-gray-700">
          <NutBam variant="secondary" onClick={onClose}>
            Đóng
          </NutBam>
          {canEdit && (
            <NutBam onClick={() => onEdit(product)}>
              <Edit size={18} className="mr-2" />
              Chỉnh sửa
            </NutBam>
          )}
        </div>
      </div>
    </HopThoai>
  )
}