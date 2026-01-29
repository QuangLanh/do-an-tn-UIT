import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Filter, ShoppingCart } from 'lucide-react'
import { Input } from '@/components/Input'
import { Card } from '@/components/Card'
import { Button } from '@/components/Button'
import { Spinner } from '@/components/Spinner'
import { Pagination } from '@/components/Pagination'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { productApi } from '@/api/productApi'
import { Product } from '@/types'
import { formatCurrency } from '@/utils/formatters'
import { useCartStore } from '@/store/cartStore'
import toast from 'react-hot-toast'

export const ProductListPage = () => {
  const navigate = useNavigate()
  const { addToCart } = useCartStore()
  
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadProducts()
    loadCategories()
  }, [])

  // Filter products by search and category
  const filteredProducts = useMemo(() => {
    let filtered = products

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((p) => p.category === selectedCategory)
    }

    // Filter by search
    if (search.trim()) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.category.toLowerCase().includes(searchLower)
      )
    }

    return filtered
  }, [products, selectedCategory, search])

  // Paginate filtered products
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredProducts.slice(startIndex, endIndex)
  }, [filteredProducts, currentPage, itemsPerPage])

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategory, search])

  const loadProducts = async () => {
    try {
      setIsLoading(true)
      const data = await productApi.getAllProducts()
      setProducts(data)
    } catch (error) {
      toast.error('Không thể tải danh sách sản phẩm')
    } finally {
      setIsLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const data = await productApi.getCategories()
      setCategories(data)
    } catch (error) {
      console.error('Không thể tải danh mục sản phẩm')
    }
  }

  const getImageUrl = (url?: string) => {
    if (!url) return ''
    if (url.startsWith('http')) return url
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000'
    const cleanUrl = url.startsWith('/') ? url : `/${url}`
    return `${apiUrl}${cleanUrl}`
  }

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation()
    addToCart(product, 1)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header />

      {/* Filter and Search Section */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex gap-3">
            {/* Category Filter */}
            <div className="relative min-w-[200px]">
              <Filter
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10"
              />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">Tất cả danh mục</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm kiếm sản phẩm..."
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8 flex-1">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <div className="text-gray-600 dark:text-gray-400">
                Tìm thấy <span className="font-semibold text-gray-900 dark:text-white">{filteredProducts.length}</span> sản phẩm
                {selectedCategory !== 'all' && (
                  <span className="ml-2">
                    trong danh mục <span className="font-semibold">{selectedCategory}</span>
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {paginatedProducts.map((product) => (
                <Card
                  key={product.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => navigate(`/products/${product.id}`)}
                >
                  <div className="w-full h-48 bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden mb-4">
                    {product.imageUrl ? (
                      <img
                        src={getImageUrl(product.imageUrl)}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/300?text=No+Image'
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>

                  <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
                    {product.name}
                  </h3>
                  
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    {product.category}
                  </p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
                      {formatCurrency(product.salePrice)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {product.unit}
                    </span>
                  </div>

                  <Button
                    size="sm"
                    className="w-full"
                    onClick={(e) => handleAddToCart(product, e)}
                  >
                    <ShoppingCart size={16} className="mr-2" />
                    Thêm vào giỏ
                  </Button>
                </Card>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                {search || selectedCategory !== 'all' 
                  ? 'Không tìm thấy sản phẩm nào phù hợp với bộ lọc'
                  : 'Không có sản phẩm nào'}
              </div>
            )}

            {/* Pagination */}
            {filteredProducts.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalItems={filteredProducts.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
                itemsPerPageOptions={[12, 24, 48, 96]}
              />
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  )
}
