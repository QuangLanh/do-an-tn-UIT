/**
 * Exchange/Return Page
 * Trang đổi/trả hàng
 */

import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { NutBam } from '@/giao-dien/components/NutBam'
import { TheThongTin } from '@/giao-dien/components/TheThongTin'
import { BangDuLieu } from '@/giao-dien/components/BangDuLieu'
import { PhanTrang } from '@/giao-dien/components/PhanTrang'
import { HuyHieu } from '@/giao-dien/components/HuyHieu'
import { NhapLieu } from '@/giao-dien/components/NhapLieu'
import { HopThoai } from '@/giao-dien/components/HopThoai'
import { Order, OrderItem } from '@/linh-vuc/orders/entities/Order'
import { Product } from '@/linh-vuc/products/entities/Product'
import { apiService } from '@/ha-tang/api'
import { formatCurrency, formatDateTime } from '@/ha-tang/utils/formatters'
import { Search, RefreshCw, RotateCcw, AlertCircle, FileText, List } from 'lucide-react'
import toast from 'react-hot-toast'

/**
 * Map backend order response to frontend Order entity
 */
function mapBackendToFrontend(backendOrder: any): Order {
  const items: OrderItem[] = (backendOrder.items || []).map((item: any) => {
    const product: Product = item.product && typeof item.product === 'object'
      ? {
          id: item.product._id || item.product.id,
          name: item.product.name || item.productName,
          category: item.product.category || '',
          importPrice: item.product.purchasePrice || 0,
          salePrice: item.product.salePrice || item.price || 0,
          stock: item.product.stock || 0,
          unit: item.product.unit || '',
          supplier: '',
          description: item.product.description,
          createdAt: new Date(item.product.createdAt || Date.now()),
          updatedAt: new Date(item.product.updatedAt || Date.now()),
        }
      : {
          id: item.product || '',
          name: item.productName || '',
          category: '',
          importPrice: 0,
          salePrice: item.price || 0,
          stock: 0,
          unit: '',
          supplier: '',
          createdAt: new Date(),
          updatedAt: new Date(),
        }

    return {
      id: item._id || item.id || '',
      productId: typeof item.product === 'string' ? item.product : (item.product?._id || item.product?.id || ''),
      product,
      quantity: item.quantity,
      unitPrice: item.price || item.unitPrice || 0,
      subtotal: item.subtotal || item.quantity * (item.price || 0),
    }
  })

  return {
    id: backendOrder._id || backendOrder.id,
    orderNumber: backendOrder.orderNumber || '',
    items,
    totalAmount: backendOrder.subtotal || backendOrder.totalAmount || 0,
    discount: backendOrder.discount || 0,
    tax: backendOrder.tax || 0,
    finalAmount: backendOrder.total || backendOrder.finalAmount || 0,
    status: backendOrder.status || 'pending',
    paymentStatus: backendOrder.paymentStatus,
    paidAt: backendOrder.paidAt ? new Date(backendOrder.paidAt) : undefined,
    wasDebt: backendOrder.wasDebt || false,
    orderType: backendOrder.orderType || 'SALE',
    relatedOrderCode: backendOrder.relatedOrderCode,
    customerName: backendOrder.customerName,
    customerPhone: backendOrder.customerPhone,
    notes: backendOrder.notes,
    createdAt: new Date(backendOrder.createdAt || Date.now()),
    updatedAt: new Date(backendOrder.updatedAt || Date.now()),
    completedAt: backendOrder.completedAt ? new Date(backendOrder.completedAt) : undefined,
  }
}

type TabType = 'search' | 'exchange' | 'return' | 'list'

interface ReturnItem {
  productId: string
  productName: string
  quantity: number
  maxQuantity: number
  price: number
}

interface ExchangeItem {
  productId: string
  quantity: number
}

export const TrangDoiTraHang = () => {
  const [activeTab, setActiveTab] = useState<TabType>('list')
  const [searchType, setSearchType] = useState<'phone' | 'code'>('phone')
  const [searchValue, setSearchValue] = useState('')
  const [foundOrders, setFoundOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Đổi hàng state
  const [returnItems, setReturnItems] = useState<ReturnItem[]>([])
  const [exchangeItems, setExchangeItems] = useState<ExchangeItem[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<string>('')
  const [exchangeQuantity, setExchangeQuantity] = useState<number>(1)

  // Trả hàng state
  const [returnOnlyItems, setReturnOnlyItems] = useState<ReturnItem[]>([])

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalType, setModalType] = useState<'exchange' | 'return'>('exchange')

  // Danh sách đổi/trả
  const [exchanges, setExchanges] = useState<Order[]>([])
  const [returns, setReturns] = useState<Order[]>([])
  const [filteredExchanges, setFilteredExchanges] = useState<Order[]>([])
  const [filteredReturns, setFilteredReturns] = useState<Order[]>([])
  const [listSearchQuery, setListSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'exchanges' | 'returns'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const navigate = useNavigate()

  useEffect(() => {
    if (activeTab === 'list') {
      loadLists()
    } else if (activeTab === 'search') {
      // Load danh sách đổi/trả để kiểm tra khi search
      loadLists()
    }
  }, [activeTab])

  useEffect(() => {
    if (listSearchQuery) {
      const filteredEx = exchanges.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(listSearchQuery.toLowerCase()) ||
          o.relatedOrderCode?.toLowerCase().includes(listSearchQuery.toLowerCase()) ||
          (o.customerName && o.customerName.toLowerCase().includes(listSearchQuery.toLowerCase()))
      )
      setFilteredExchanges(filteredEx)

      const filteredRet = returns.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(listSearchQuery.toLowerCase()) ||
          o.relatedOrderCode?.toLowerCase().includes(listSearchQuery.toLowerCase()) ||
          (o.customerName && o.customerName.toLowerCase().includes(listSearchQuery.toLowerCase()))
      )
      setFilteredReturns(filteredRet)
    } else {
      setFilteredExchanges(exchanges)
      setFilteredReturns(returns)
    }
    // Reset về trang 1 khi tìm kiếm hoặc thay đổi filter
    setCurrentPage(1)
  }, [listSearchQuery, exchanges, returns, filterType])

  // Tính toán dữ liệu hiển thị dựa trên filter type
  const filteredData = useMemo(() => {
    if (filterType === 'exchanges') {
      return filteredExchanges
    } else if (filterType === 'returns') {
      return filteredReturns
    } else {
      // Tất cả: kết hợp cả exchanges và returns
      return [...filteredExchanges, ...filteredReturns]
    }
  }, [filterType, filteredExchanges, filteredReturns])

  // Tính toán dữ liệu phân trang
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredData.slice(startIndex, endIndex)
  }, [filteredData, currentPage, itemsPerPage])

  const loadLists = async () => {
    try {
      setIsLoading(true)
      const [exchangesData, returnsData] = await Promise.all([
        apiService.orders.exchanges(),
        apiService.orders.returns(),
      ])
      // Map data từ backend
      const mappedExchanges = Array.isArray(exchangesData) ? exchangesData.map(mapBackendToFrontend) : []
      const mappedReturns = Array.isArray(returnsData) ? returnsData.map(mapBackendToFrontend) : []
      
      setExchanges(mappedExchanges)
      setReturns(mappedReturns)
      setFilteredExchanges(mappedExchanges)
      setFilteredReturns(mappedReturns)
    } catch (error) {
      toast.error('Không thể tải danh sách đổi/trả hàng')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchValue.trim()) {
      toast.error('Vui lòng nhập số điện thoại hoặc mã đơn hàng')
      return
    }

    try {
      setIsLoading(true)
      let orders: Order[] = []

      if (searchType === 'phone') {
        const data = await apiService.orders.searchByPhone(searchValue.trim())
        // Map data từ backend
        orders = Array.isArray(data) ? data.map(mapBackendToFrontend) : []
      } else {
        const data = await apiService.orders.searchByCode(searchValue.trim())
        // Map data từ backend
        orders = data ? [mapBackendToFrontend(data)] : []
      }

      if (orders.length === 0) {
        toast.error('Không tìm thấy đơn hàng nào')
        setFoundOrders([])
        setSelectedOrder(null)
      } else {
        // Filter ra các đơn hàng chưa được đổi/trả
        const availableOrders = orders.filter(order => {
          const checkResult = isOrderAlreadyProcessed(order.orderNumber)
          return !checkResult.processed
        })

        if (availableOrders.length === 0) {
          toast.error('Tất cả đơn hàng tìm được đã được đổi/trả rồi')
          setFoundOrders([])
          setSelectedOrder(null)
        } else {
          // Hiển thị cảnh báo nếu có đơn hàng đã được xử lý
          const processedCount = orders.length - availableOrders.length
          if (processedCount > 0) {
            toast.error(`${processedCount} đơn hàng đã được đổi/trả và đã được ẩn khỏi danh sách`)
          }

          setFoundOrders(availableOrders)
          if (availableOrders.length === 1) {
            handleSelectOrder(availableOrders[0])
          } else {
            toast.success(`Tìm thấy ${availableOrders.length} đơn hàng có thể đổi/trả`)
          }
        }
      }
    } catch (error) {
      toast.error('Không thể tìm kiếm đơn hàng')
      console.error(error)
      setFoundOrders([])
      setSelectedOrder(null)
    } finally {
      setIsLoading(false)
    }
  }

  // Kiểm tra xem đơn hàng đã được đổi/trả chưa
  const isOrderAlreadyProcessed = (orderNumber: string): { processed: boolean; type?: 'exchange' | 'return' } => {
    const isExchanged = exchanges.some(ex => ex.relatedOrderCode === orderNumber)
    const isReturned = returns.some(ret => ret.relatedOrderCode === orderNumber)
    
    if (isExchanged) {
      return { processed: true, type: 'exchange' }
    }
    if (isReturned) {
      return { processed: true, type: 'return' }
    }
    return { processed: false }
  }

  const handleSelectOrder = (order: Order) => {
    // Kiểm tra xem đơn hàng đã được đổi/trả chưa
    const checkResult = isOrderAlreadyProcessed(order.orderNumber)
    if (checkResult.processed) {
      const typeText = checkResult.type === 'exchange' ? 'đổi hàng' : 'trả hàng'
      toast.error(`Đơn hàng ${order.orderNumber} đã được ${typeText} rồi. Không thể ${typeText} lại.`)
      return
    }

    setSelectedOrder(order)
    
    // Reset states
    setReturnItems([])
    setExchangeItems([])
    setReturnOnlyItems([])

    // Load danh sách sản phẩm để đổi
    loadProducts()
  }

  const loadProducts = async () => {
    try {
      const data = await apiService.products.list()
      // Map từ backend format (_id) sang frontend format (id)
      const mappedProducts = Array.isArray(data) 
        ? data.map((p: any) => ({
            id: p._id || p.id,
            name: p.name,
            barcode: p.barcode,
            category: p.category || '',
            importPrice: p.purchasePrice || p.importPrice || 0,
            salePrice: p.salePrice || 0,
            stock: p.stock || 0,
            unit: p.unit || '',
            supplier: p.supplier || '',
            description: p.description,
            imageUrl: p.imageUrl,
            createdAt: new Date(p.createdAt || Date.now()),
            updatedAt: new Date(p.updatedAt || Date.now()),
          }))
        : []
      setProducts(mappedProducts)
    } catch (error) {
      console.error('Cannot load products:', error)
      toast.error('Không thể tải danh sách sản phẩm')
    }
  }

  const handleAddReturnItem = (item: any) => {
    const productId = item.product?.id || item.product?._id || item.product
    const existingItem = returnItems.find(r => r.productId === productId)
    if (existingItem) {
      toast.error('Sản phẩm đã được thêm vào danh sách')
      return
    }

    setReturnItems([...returnItems, {
      productId: productId,
      productName: item.productName || item.product?.name || '',
      quantity: 1,
      maxQuantity: item.quantity,
      price: item.price || item.unitPrice,
    }])
  }

  const handleUpdateReturnQuantity = (productId: string, quantity: number) => {
    setReturnItems(returnItems.map(item =>
      item.productId === productId ? { ...item, quantity } : item
    ))
  }

  const handleRemoveReturnItem = (productId: string) => {
    setReturnItems(returnItems.filter(item => item.productId !== productId))
  }

  const handleAddExchangeItem = () => {
    console.log('handleAddExchangeItem called:', { selectedProduct, exchangeQuantity, productsCount: products.length })
    
    if (!selectedProduct || selectedProduct.trim() === '') {
      toast.error('Vui lòng chọn sản phẩm đổi')
      return
    }

    if (!exchangeQuantity || exchangeQuantity < 1) {
      toast.error('Số lượng phải lớn hơn 0')
      return
    }

    if (products.length === 0) {
      toast.error('Danh sách sản phẩm chưa được tải. Vui lòng thử lại.')
      loadProducts()
      return
    }

    // Nếu selectedProduct có vẻ như là text (chứa dấu ₫ hoặc "Kho:"), 
    // thử tìm product theo tên
    let product = products.find(p => String(p.id) === String(selectedProduct))
    
    // Nếu không tìm thấy và selectedProduct có vẻ như là text hiển thị
    if (!product && selectedProduct.includes('₫')) {
      // Extract tên sản phẩm từ text (phần trước dấu "-")
      const productName = selectedProduct.split(' - ')[0]?.trim()
      if (productName) {
        product = products.find(p => p.name === productName)
        console.log('Trying to find by name:', productName, product ? 'Found' : 'Not found')
      }
    }

    if (!product) {
      toast.error('Không tìm thấy sản phẩm')
      console.error('Product not found:', { 
        selectedProduct, 
        selectedProductType: typeof selectedProduct,
        productsCount: products.length,
        firstFewProductIds: products.slice(0, 5).map(p => ({ id: String(p.id), name: p.name }))
      })
      return
    }

    if (product.stock < exchangeQuantity) {
      toast.error(`Kho không đủ. Còn ${product.stock} ${product.unit}`)
      return
    }

    const existingItem = exchangeItems.find(e => String(e.productId) === String(selectedProduct))
    if (existingItem) {
      const newQuantity = existingItem.quantity + exchangeQuantity
      if (product.stock < newQuantity) {
        toast.error(`Kho không đủ. Tổng số lượng: ${newQuantity}, còn ${product.stock} ${product.unit}`)
        return
      }
      setExchangeItems(exchangeItems.map(item =>
        String(item.productId) === String(selectedProduct)
          ? { ...item, quantity: newQuantity }
          : item
      ))
    } else {
      setExchangeItems([...exchangeItems, {
        productId: selectedProduct,
        quantity: exchangeQuantity,
      }])
    }

    setSelectedProduct('')
    setExchangeQuantity(1)
    toast.success('Đã thêm sản phẩm đổi')
  }

  const handleRemoveExchangeItem = (productId: string) => {
    setExchangeItems(exchangeItems.filter(item => item.productId !== productId))
  }

  // Trả hàng
  const handleAddReturnOnlyItem = (item: any) => {
    const productId = item.product?.id || item.product?._id || item.product
    const existingItem = returnOnlyItems.find(r => r.productId === productId)
    if (existingItem) {
      toast.error('Sản phẩm đã được thêm vào danh sách')
      return
    }

    setReturnOnlyItems([...returnOnlyItems, {
      productId: productId,
      productName: item.productName || item.product?.name || '',
      quantity: 1,
      maxQuantity: item.quantity,
      price: item.price || item.unitPrice,
    }])
  }

  const handleUpdateReturnOnlyQuantity = (productId: string, quantity: number) => {
    setReturnOnlyItems(returnOnlyItems.map(item =>
      item.productId === productId ? { ...item, quantity } : item
    ))
  }

  const handleRemoveReturnOnlyItem = (productId: string) => {
    setReturnOnlyItems(returnOnlyItems.filter(item => item.productId !== productId))
  }

  const handleOpenExchangeModal = () => {
    if (returnItems.length === 0) {
      toast.error('Vui lòng chọn sản phẩm cần trả')
      return
    }
    if (exchangeItems.length === 0) {
      toast.error('Vui lòng chọn sản phẩm đổi')
      return
    }
    setModalType('exchange')
    setIsModalOpen(true)
  }

  const handleOpenReturnModal = () => {
    if (returnOnlyItems.length === 0) {
      toast.error('Vui lòng chọn sản phẩm cần trả')
      return
    }
    setModalType('return')
    setIsModalOpen(true)
  }

  const handleConfirmExchange = async () => {
    if (!selectedOrder) return

    try {
      const exchangeData = {
        originalOrderCode: selectedOrder.orderNumber,
        returnItems: returnItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        exchangeItems: exchangeItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      }

      const result = await apiService.orders.exchange(exchangeData)
      toast.success(`Đổi hàng thành công! Mã đơn: ${result.orderNumber}`)
      setIsModalOpen(false)
      resetForm()
      // Reload danh sách
      loadLists()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể đổi hàng')
      console.error(error)
    }
  }

  const handleConfirmReturn = async () => {
    if (!selectedOrder) return

    try {
      const returnData = {
        originalOrderCode: selectedOrder.orderNumber,
        returnItems: returnOnlyItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      }

      const result = await apiService.orders.return(returnData)
      toast.success(`Trả hàng thành công! Mã đơn: ${result.orderNumber}`)
      setIsModalOpen(false)
      resetForm()
      // Reload danh sách
      loadLists()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể trả hàng')
      console.error(error)
    }
  }

  const resetForm = () => {
    setSelectedOrder(null)
    setFoundOrders([])
    setSearchValue('')
    setReturnItems([])
    setExchangeItems([])
    setReturnOnlyItems([])
    setActiveTab('search')
  }

  const calculateExchangeDifference = () => {
    const returnTotal = returnItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const exchangeTotal = exchangeItems.reduce((sum, item) => {
      const product = products.find(p => p.id === item.productId)
      return sum + ((product?.salePrice || 0) * item.quantity)
    }, 0)
    return exchangeTotal - returnTotal
  }

  const calculateReturnTotal = () => {
    return returnOnlyItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }

  const handleViewOrder = (order: Order) => {
    navigate(`/orders/${order.id}`)
  }

  const columns = [
    {
      header: 'Mã đơn',
      accessor: (order: Order) => (
        <div>
          <div className="font-medium">{order.orderNumber}</div>
          {order.relatedOrderCode && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Từ: {order.relatedOrderCode}
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Loại',
      accessor: (order: Order) => (
        <HuyHieu variant={order.orderType === 'EXCHANGE' ? 'info' : 'warning'}>
          {order.orderType === 'EXCHANGE' ? (
            <>
              <RefreshCw size={14} className="inline mr-1" />
              Đổi hàng
            </>
          ) : (
            <>
              <RotateCcw size={14} className="inline mr-1" />
              Trả hàng
            </>
          )}
        </HuyHieu>
      ),
    },
    {
      header: 'Khách hàng',
      accessor: (order: Order) => (
        <div>
          <div className="font-medium">{order.customerName || 'Không có tên'}</div>
          {order.customerPhone && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {order.customerPhone}
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Tổng tiền',
      accessor: (order: Order) => (
        <span className={`font-bold ${order.finalAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {formatCurrency(order.finalAmount)}
        </span>
      ),
    },
    {
      header: 'Ngày tạo',
      accessor: (order: Order) => {
        try {
          return formatDateTime(order.createdAt)
        } catch {
          return 'N/A'
        }
      },
    },
    {
      header: 'Thao tác',
      accessor: (order: Order) => (
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleViewOrder(order)
          }}
          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded"
          title="Xem chi tiết"
        >
          <FileText size={16} />
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
          <RefreshCw className="mr-3" size={32} />
          Đổi / Trả hàng
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Tìm kiếm đơn hàng và thực hiện đổi/trả sản phẩm
        </p>
      </div>

      {/* Main Tabs */}
      <div className="flex space-x-4 border-b dark:border-gray-600">
        <button
          onClick={() => setActiveTab('list')}
          className={`pb-2 px-4 font-medium ${
            activeTab === 'list'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          <List size={16} className="inline mr-2" />
          Danh sách Đổi/Trả
        </button>
        <button
          onClick={() => setActiveTab('search')}
          className={`pb-2 px-4 font-medium ${
            activeTab === 'search'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          <Search size={16} className="inline mr-2" />
          Đổi / Trả hàng
        </button>
      </div>

      {/* Tab: Tìm kiếm */}
      {activeTab === 'search' && (
        <>
          {/* Search Section */}
          <TheThongTin>
            <h2 className="text-xl font-semibold mb-4">Tìm kiếm đơn hàng</h2>
            <div className="space-y-4">
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="phone"
                    name="searchType"
                    value="phone"
                    checked={searchType === 'phone'}
                    onChange={() => setSearchType('phone')}
                    className="w-4 h-4"
                  />
                  <label htmlFor="phone" className="text-gray-700 dark:text-gray-300">
                    Số điện thoại
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="code"
                    name="searchType"
                    value="code"
                    checked={searchType === 'code'}
                    onChange={() => setSearchType('code')}
                    className="w-4 h-4"
                  />
                  <label htmlFor="code" className="text-gray-700 dark:text-gray-300">
                    Mã đơn hàng
                  </label>
                </div>
              </div>

              <div className="flex space-x-2">
                <div className="flex-1 relative">
                  <Search
                    size={20}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <NhapLieu
                    type="text"
                    placeholder={searchType === 'phone' ? 'Nhập số điện thoại khách hàng...' : 'Nhập mã đơn hàng (ORDxxxxx)...'}
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10"
                  />
                </div>
                <NutBam onClick={handleSearch} disabled={isLoading}>
                  {isLoading ? 'Đang tìm...' : 'Tìm kiếm'}
                </NutBam>
              </div>
            </div>

            {/* Danh sách đơn hàng tìm được */}
            {foundOrders.length > 1 && (
              <div className="mt-4 space-y-2">
                <h3 className="font-semibold">Chọn đơn hàng:</h3>
                {foundOrders.map((order) => {
                  const checkResult = isOrderAlreadyProcessed(order.orderNumber)
                  const isProcessed = checkResult.processed
                  
                  return (
                  <div
                    key={order.id}
                    onClick={() => !isProcessed && handleSelectOrder(order)}
                    className={`p-4 border rounded-lg ${
                      isProcessed 
                        ? 'cursor-not-allowed opacity-50 bg-gray-100 dark:bg-gray-800' 
                        : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700'
                    } ${
                      selectedOrder?.id === order.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <div className="flex justify-between">
                      <div className="flex-1">
                        <div className="font-semibold">{order.orderNumber}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {order.customerName} - {order.customerPhone}
                        </div>
                        {isProcessed && (
                          <div className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                            ⚠️ Đã được {checkResult.type === 'exchange' ? 'đổi hàng' : 'trả hàng'}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatCurrency(order.finalAmount)}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {order.createdAt ? formatDateTime(order.createdAt) : 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>
                  )
                })
                }
              </div>
            )}
          </TheThongTin>

          {/* Chi tiết đơn hàng đã chọn */}
          {selectedOrder && (
            <>
              <TheThongTin>
                <h2 className="text-xl font-semibold mb-4">Chi tiết đơn hàng: {selectedOrder.orderNumber}</h2>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Khách hàng</p>
                    <p className="font-semibold">{selectedOrder.customerName || 'Không có tên'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Số điện thoại</p>
                    <p className="font-semibold">{selectedOrder.customerPhone || 'Không có'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Ngày mua</p>
                    <p className="font-semibold">
                      {selectedOrder.createdAt ? formatDateTime(selectedOrder.createdAt) : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Tổng tiền</p>
                    <p className="font-semibold text-green-600">{formatCurrency(selectedOrder.finalAmount)}</p>
                  </div>
                </div>

                <h3 className="font-semibold mb-2">Danh sách sản phẩm:</h3>
                <div className="space-y-2">
                  {selectedOrder.items && selectedOrder.items.map((item, index) => (
                    <div key={item.id || index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                      <div className="flex-1">
                        <div className="font-medium">{item.product?.name || item.productId}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          SL: {item.quantity} {item.product?.unit} × {formatCurrency(item.unitPrice)}
                        </div>
                      </div>
                      <div className="font-semibold">{formatCurrency(item.subtotal)}</div>
                    </div>
                  ))}
                </div>

                {/* Sub Tabs */}
                <div className="mt-6 flex space-x-4 border-b dark:border-gray-600">
                  <button
                    onClick={() => setActiveTab('exchange')}
                    className="pb-2 px-4 font-medium text-blue-600 hover:text-blue-700"
                  >
                    <RefreshCw size={16} className="inline mr-2" />
                    Đổi hàng
                  </button>
                  <button
                    onClick={() => setActiveTab('return')}
                    className="pb-2 px-4 font-medium text-blue-600 hover:text-blue-700"
                  >
                    <RotateCcw size={16} className="inline mr-2" />
                    Trả hàng
                  </button>
                </div>
              </TheThongTin>
            </>
          )}
        </>
      )}

      {/* Tab: Đổi hàng */}
      {activeTab === 'exchange' && selectedOrder && (
        <TheThongTin>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Đổi hàng - {selectedOrder.orderNumber}</h3>
            <NutBam size="sm" variant="secondary" onClick={() => setActiveTab('search')}>
              ← Quay lại
            </NutBam>
          </div>
          
          {/* Bước 1: Chọn sản phẩm cần trả */}
          <div className="mb-6">
            <h4 className="font-medium mb-2">1. Chọn sản phẩm cần trả:</h4>
            {selectedOrder.items && selectedOrder.items.map((item, index) => (
              <div key={item.id || index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded mb-2">
                <div className="flex-1">
                  <div className="font-medium">{item.product?.name || item.productId}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Đã mua: {item.quantity} {item.product?.unit}
                  </div>
                </div>
                <NutBam
                  size="sm"
                  variant="secondary"
                  onClick={() => handleAddReturnItem(item)}
                  disabled={returnItems.some(r => r.productId === (item.product?.id || item.product))}
                >
                  {returnItems.some(r => r.productId === (item.product?.id || item.product)) ? 'Đã chọn' : 'Chọn'}
                </NutBam>
              </div>
            ))}
          </div>

          {/* Danh sách sản phẩm trả */}
          {returnItems.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium mb-2">Sản phẩm cần trả:</h4>
              {returnItems.map((item) => (
                <div key={item.productId} className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-900 rounded mb-2">
                  <div className="flex-1">
                    <div className="font-medium">{item.productName}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {formatCurrency(item.price)}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <NhapLieu
                      type="number"
                      min="1"
                      max={item.maxQuantity}
                      value={item.quantity}
                      onChange={(e) => handleUpdateReturnQuantity(item.productId, parseInt(e.target.value) || 1)}
                      className="w-20"
                    />
                    <span className="text-sm">/ {item.maxQuantity}</span>
                    <button
                      onClick={() => handleRemoveReturnItem(item.productId)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
              <div className="text-right font-semibold">
                Tổng tiền trả: {formatCurrency(returnItems.reduce((sum, item) => sum + item.price * item.quantity, 0))}
              </div>
            </div>
          )}

          {/* Bước 2: Chọn sản phẩm đổi */}
          <div className="mb-6">
            <h4 className="font-medium mb-2">2. Chọn sản phẩm mới:</h4>
            <div className="flex space-x-2 mb-4">
              <select
                value={selectedProduct}
                onChange={(e) => {
                  const value = e.target.value
                  console.log('Select onChange:', { value, selectedIndex: e.target.selectedIndex })
                  // Đảm bảo chỉ lấy value, không phải text
                  if (value && value !== '-- Chọn sản phẩm --') {
                    setSelectedProduct(value)
                  } else {
                    setSelectedProduct('')
                  }
                }}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="">-- Chọn sản phẩm --</option>
                {products.map((product) => (
                  <option key={product.id} value={String(product.id)}>
                    {product.name} - {formatCurrency(product.salePrice)} (Kho: {product.stock} {product.unit})
                  </option>
                ))}
              </select>
              <NhapLieu
                type="number"
                min="1"
                value={exchangeQuantity}
                onChange={(e) => setExchangeQuantity(parseInt(e.target.value) || 1)}
                className="w-24"
                placeholder="SL"
              />
              <NutBam onClick={handleAddExchangeItem}>
                Thêm
              </NutBam>
            </div>

            {/* Danh sách sản phẩm đổi */}
            {exchangeItems.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Sản phẩm đổi:</h4>
                {exchangeItems.map((item) => {
                  const product = products.find(p => p.id === item.productId)
                  return (
                    <div key={item.productId} className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900 rounded mb-2">
                      <div className="flex-1">
                        <div className="font-medium">{product?.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {formatCurrency(product?.salePrice || 0)} × {item.quantity}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">
                          {formatCurrency((product?.salePrice || 0) * item.quantity)}
                        </span>
                        <button
                          onClick={() => handleRemoveExchangeItem(item.productId)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  )
                })}
                <div className="text-right space-y-1">
                  <div className="font-semibold">
                    Tổng tiền sản phẩm mới: {formatCurrency(exchangeItems.reduce((sum, item) => {
                      const product = products.find(p => p.id === item.productId)
                      return sum + ((product?.salePrice || 0) * item.quantity)
                    }, 0))}
                  </div>
                  <div className="text-lg font-bold">
                    Chênh lệch: <span className={calculateExchangeDifference() >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {formatCurrency(Math.abs(calculateExchangeDifference()))}
                      {calculateExchangeDifference() >= 0 ? ' (Khách trả thêm)' : ' (Hoàn lại khách)'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <NutBam onClick={handleOpenExchangeModal} variant="success">
              Xác nhận đổi hàng
            </NutBam>
          </div>
        </TheThongTin>
      )}

      {/* Tab: Trả hàng */}
      {activeTab === 'return' && selectedOrder && (
        <TheThongTin>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Trả hàng - {selectedOrder.orderNumber}</h3>
            <NutBam size="sm" variant="secondary" onClick={() => setActiveTab('search')}>
              ← Quay lại
            </NutBam>
          </div>
          
          {/* Chọn sản phẩm cần trả */}
          <div className="mb-6">
            <h4 className="font-medium mb-2">Chọn sản phẩm cần trả:</h4>
            {selectedOrder.items && selectedOrder.items.map((item, index) => (
              <div key={item.id || index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded mb-2">
                <div className="flex-1">
                  <div className="font-medium">{item.product?.name || item.productId}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Đã mua: {item.quantity} {item.product?.unit} × {formatCurrency(item.unitPrice)}
                  </div>
                </div>
                <NutBam
                  size="sm"
                  variant="secondary"
                  onClick={() => handleAddReturnOnlyItem(item)}
                  disabled={returnOnlyItems.some(r => r.productId === (item.product?.id || item.product))}
                >
                  {returnOnlyItems.some(r => r.productId === (item.product?.id || item.product)) ? 'Đã chọn' : 'Chọn'}
                </NutBam>
              </div>
            ))}
          </div>

          {/* Danh sách sản phẩm trả */}
          {returnOnlyItems.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium mb-2">Sản phẩm cần trả:</h4>
              {returnOnlyItems.map((item) => (
                <div key={item.productId} className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900 rounded mb-2">
                  <div className="flex-1">
                    <div className="font-medium">{item.productName}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {formatCurrency(item.price)}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <NhapLieu
                      type="number"
                      min="1"
                      max={item.maxQuantity}
                      value={item.quantity}
                      onChange={(e) => handleUpdateReturnOnlyQuantity(item.productId, parseInt(e.target.value) || 1)}
                      className="w-20"
                    />
                    <span className="text-sm">/ {item.maxQuantity}</span>
                    <button
                      onClick={() => handleRemoveReturnOnlyItem(item.productId)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
              <div className="text-right font-bold text-lg text-red-600">
                Tổng tiền hoàn trả: {formatCurrency(calculateReturnTotal())}
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <NutBam onClick={handleOpenReturnModal} variant="danger">
              Xác nhận trả hàng
            </NutBam>
          </div>
        </TheThongTin>
      )}

      {/* Tab: Danh sách */}
      {activeTab === 'list' && (
        <>
          <TheThongTin>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Danh sách Đổi / Trả hàng</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Đơn đổi: {exchanges.length} | Đơn trả: {returns.length}
              </p>
            </div>

            {/* Search and Filter */}
            <div className="mb-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                  <Search
                    size={20}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <NhapLieu
                    type="text"
                    placeholder="Tìm kiếm theo mã đơn, mã đơn gốc, hoặc tên khách hàng..."
                    value={listSearchQuery}
                    onChange={(e) => setListSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {/* Filter Dropdown */}
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    Lọc:
                  </label>
                  <select
                    value={filterType}
                    onChange={(e) => {
                      setFilterType(e.target.value as 'all' | 'exchanges' | 'returns')
                      setCurrentPage(1)
                    }}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent min-w-[180px]"
                  >
                    <option value="all">Tất cả</option>
                    <option value="exchanges">Đơn đổi hàng ({exchanges.length})</option>
                    <option value="returns">Đơn trả hàng ({returns.length})</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Table */}
            {isLoading ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Đang tải...
              </div>
            ) : filteredData.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                {listSearchQuery 
                  ? 'Không tìm thấy đơn hàng nào' 
                  : filterType === 'exchanges' 
                    ? 'Chưa có đơn đổi hàng nào'
                    : filterType === 'returns'
                    ? 'Chưa có đơn trả hàng nào'
                    : 'Chưa có đơn hàng nào'}
              </div>
            ) : (
              <>
                <BangDuLieu
                  data={paginatedData}
                  columns={columns}
                  onRowClick={handleViewOrder}
                />
                {filteredData.length > 0 && (
                  <PhanTrang
                    currentPage={currentPage}
                    totalItems={filteredData.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                    onItemsPerPageChange={setItemsPerPage}
                    itemsPerPageOptions={[10, 20, 50, 100]}
                  />
                )}
              </>
            )}
          </TheThongTin>
        </>
      )}

      {/* Modal xác nhận đổi hàng */}
      <HopThoai
        isOpen={isModalOpen && modalType === 'exchange'}
        onClose={() => setIsModalOpen(false)}
        title="Xác nhận đổi hàng"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="text-blue-500 mt-0.5" size={24} />
            <div className="flex-1">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Xác nhận đổi hàng cho đơn <strong>{selectedOrder?.orderNumber}</strong>?
              </p>
              
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-semibold mb-1">Sản phẩm trả lại:</p>
                  {returnItems.map(item => (
                    <div key={item.productId} className="text-gray-600 dark:text-gray-400">
                      - {item.productName}: {item.quantity} × {formatCurrency(item.price)}
                    </div>
                  ))}
                </div>

                <div>
                  <p className="font-semibold mb-1">Sản phẩm nhận về:</p>
                  {exchangeItems.map(item => {
                    const product = products.find(p => p.id === item.productId)
                    return (
                      <div key={item.productId} className="text-gray-600 dark:text-gray-400">
                        - {product?.name}: {item.quantity} × {formatCurrency(product?.salePrice || 0)}
                      </div>
                    )
                  })}
                </div>

                <div className="pt-2 border-t">
                  <p className="font-bold text-lg">
                    Chênh lệch: <span className={calculateExchangeDifference() >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {formatCurrency(Math.abs(calculateExchangeDifference()))}
                      {calculateExchangeDifference() >= 0 ? ' (Khách trả thêm)' : ' (Hoàn lại khách)'}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <NutBam
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Hủy
            </NutBam>
            <NutBam onClick={handleConfirmExchange}>
              Đồng ý đổi hàng
            </NutBam>
          </div>
        </div>
      </HopThoai>

      {/* Modal xác nhận trả hàng */}
      <HopThoai
        isOpen={isModalOpen && modalType === 'return'}
        onClose={() => setIsModalOpen(false)}
        title="Xác nhận trả hàng"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="text-red-500 mt-0.5" size={24} />
            <div className="flex-1">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Xác nhận trả hàng cho đơn <strong>{selectedOrder?.orderNumber}</strong>?
              </p>
              
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-semibold mb-1">Sản phẩm trả:</p>
                  {returnOnlyItems.map(item => (
                    <div key={item.productId} className="text-gray-600 dark:text-gray-400">
                      - {item.productName}: {item.quantity} × {formatCurrency(item.price)}
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t">
                  <p className="font-bold text-lg text-red-600">
                    Tổng tiền hoàn trả: {formatCurrency(calculateReturnTotal())}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <NutBam
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Hủy
            </NutBam>
            <NutBam onClick={handleConfirmReturn} variant="danger">
              Đồng ý trả hàng
            </NutBam>
          </div>
        </div>
      </HopThoai>
    </div>
  )
}
