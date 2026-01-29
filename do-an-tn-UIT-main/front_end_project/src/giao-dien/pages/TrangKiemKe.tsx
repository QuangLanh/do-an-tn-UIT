/**
 * Inventory Page
 * Trang quản lý tồn kho với cảnh báo sắp hết hàng
 */

import { useEffect, useState, useMemo } from 'react'
import { AlertTriangle, Package, TrendingDown } from 'lucide-react'
import { TheThongTin } from '@/giao-dien/components/TheThongTin'
import { BangDuLieu } from '@/giao-dien/components/BangDuLieu'
import { HuyHieu } from '@/giao-dien/components/HuyHieu'
import { TheThongKe } from '@/giao-dien/components/TheThongKe'
import { PhanTrang } from '@/giao-dien/components/PhanTrang'
import { Product } from '@/linh-vuc/products/entities/Product'
import { InventoryAlert } from '@/linh-vuc/inventory/entities/InventoryAlert'
import { productApi } from '@/ha-tang/api/productApi'
import { InventoryService } from '@/linh-vuc/inventory/services/InventoryService'
import { formatCurrency } from '@/ha-tang/utils/formatters'
import toast from 'react-hot-toast'

const inventoryService = new InventoryService()

export const TrangKiemKe = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [alerts, setAlerts] = useState<InventoryAlert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [alertsCurrentPage, setAlertsCurrentPage] = useState(1)
  const [alertsItemsPerPage, setAlertsItemsPerPage] = useState(10)
  const [productsCurrentPage, setProductsCurrentPage] = useState(1)
  const [productsItemsPerPage, setProductsItemsPerPage] = useState(10)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const data = await productApi.getAllProducts.execute()
      setProducts(data)
      const generatedAlerts = inventoryService.generateInventoryAlerts(data)
      setAlerts(generatedAlerts)
    } catch (error) {
      toast.error('Không thể tải dữ liệu tồn kho')
    } finally {
      setIsLoading(false)
    }
  }

  // Tính toán các giá trị thống kê
  const lowStockProducts = useMemo(() => {
    return inventoryService.getLowStockProducts(products)
  }, [products])

  const criticalStockProducts = useMemo(() => {
    return inventoryService.getCriticalStockProducts(products)
  }, [products])

  const outOfStockProducts = useMemo(() => {
    return inventoryService.getOutOfStockProducts(products)
  }, [products])

  const totalInventoryValue = useMemo(() => {
    return inventoryService.calculateTotalInventoryValue(products)
  }, [products])

  // Tính toán dữ liệu phân trang cho alerts
  const paginatedAlerts = useMemo(() => {
    const startIndex = (alertsCurrentPage - 1) * alertsItemsPerPage
    const endIndex = startIndex + alertsItemsPerPage
    return alerts.slice(startIndex, endIndex)
  }, [alerts, alertsCurrentPage, alertsItemsPerPage])

  // Tính toán dữ liệu phân trang cho products
  const paginatedProducts = useMemo(() => {
    const startIndex = (productsCurrentPage - 1) * productsItemsPerPage
    const endIndex = startIndex + productsItemsPerPage
    return products.slice(startIndex, endIndex)
  }, [products, productsCurrentPage, productsItemsPerPage])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">Đang tải...</div>
      </div>
    )
  }

  const alertColumns = [
    {
      header: 'Sản phẩm',
      accessor: (alert: InventoryAlert) => (
        <div className="flex items-center space-x-2">
          {alert.alertLevel === 'out_of_stock' && (
            <AlertTriangle size={16} className="text-red-600" />
          )}
          {alert.alertLevel === 'critical' && (
            <AlertTriangle size={16} className="text-orange-600" />
          )}
          {alert.alertLevel === 'low' && (
            <TrendingDown size={16} className="text-yellow-600" />
          )}
          <span>{alert.product.name}</span>
        </div>
      ),
    },
    {
      header: 'Danh mục',
      accessor: (alert: InventoryAlert) => alert.product.category,
    },
    {
      header: 'Tồn kho hiện tại',
      accessor: (alert: InventoryAlert) => (
        <HuyHieu
          variant={
            alert.alertLevel === 'out_of_stock'
              ? 'danger'
              : alert.alertLevel === 'critical'
              ? 'warning'
              : 'default'
          }
        >
          {alert.currentStock} {alert.product.unit}
        </HuyHieu>
      ),
    },
    {
      header: 'Mức độ',
      accessor: (alert: InventoryAlert) => {
        const levelText = {
          out_of_stock: 'Hết hàng',
          critical: 'Rất thấp',
          low: 'Thấp',
        }
        return (
          <HuyHieu
            variant={
              alert.alertLevel === 'out_of_stock'
                ? 'danger'
                : alert.alertLevel === 'critical'
                ? 'warning'
                : 'info'
            }
          >
            {levelText[alert.alertLevel]}
          </HuyHieu>
        )
      },
    },
    {
      header: 'Đề xuất nhập thêm',
      accessor: (alert: InventoryAlert) => (
        <span className="font-semibold text-blue-600 dark:text-blue-400">
          {alert.suggestedReorderQuantity} {alert.product.unit}
        </span>
      ),
    },
    {
      header: 'Giá trị cần nhập',
      accessor: (alert: InventoryAlert) =>
        formatCurrency(alert.suggestedReorderQuantity * alert.product.importPrice),
    },
  ]

  const allProductsColumns = [
    { header: 'Tên sản phẩm', accessor: 'name' as keyof Product },
    { header: 'Danh mục', accessor: 'category' as keyof Product },
    {
      header: 'Tồn kho',
      accessor: (product: Product) => (
        <span className={product.stock < 10 ? 'text-red-600 font-semibold' : ''}>
          {product.stock} {product.unit}
        </span>
      ),
    },
    {
      header: 'Giá trị tồn',
      accessor: (product: Product) => formatCurrency(product.importPrice * product.stock),
    },
    { header: 'Nhà cung cấp', accessor: 'supplier' as keyof Product },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quản lý tồn kho</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Theo dõi và quản lý tồn kho sản phẩm
        </p>
      </div>

      {/* Thống kê nhanh */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <TheThongKe
          title="Tổng giá trị tồn kho"
          value={formatCurrency(totalInventoryValue)}
          icon={Package}
          color="blue"
        />
        <TheThongKe
          title="Sắp hết hàng"
          value={lowStockProducts.length}
          icon={TrendingDown}
          color="yellow"
        />
        <TheThongKe
          title="Tồn kho rất thấp"
          value={criticalStockProducts.length}
          icon={AlertTriangle}
          color="red"
        />
        <TheThongKe
          title="Hết hàng"
          value={outOfStockProducts.length}
          icon={AlertTriangle}
          color="red"
        />
      </div>

      {/* Alert Section */}
      {alerts.length > 0 && (
        <>
          <TheThongTin title="⚠️ Cảnh báo tồn kho">
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Các sản phẩm sau cần được nhập thêm hàng:
              </p>
              <BangDuLieu data={paginatedAlerts} columns={alertColumns} />
            </div>
          </TheThongTin>

          {/* Pagination - Separate section below alerts table */}
          <div className="px-6">
            <PhanTrang
              currentPage={alertsCurrentPage}
              totalItems={alerts.length}
              itemsPerPage={alertsItemsPerPage}
              onPageChange={setAlertsCurrentPage}
              onItemsPerPageChange={setAlertsItemsPerPage}
              itemsPerPageOptions={[10, 20, 50, 100]}
            />
          </div>
        </>
      )}

      {/* All Products Inventory */}
      <TheThongTin title="Tồn kho tất cả sản phẩm">
        <BangDuLieu data={paginatedProducts} columns={allProductsColumns} />
      </TheThongTin>

      {/* Pagination - Separate section below products table */}
      {products.length > 0 && (
        <div className="px-6">
          <PhanTrang
            currentPage={productsCurrentPage}
            totalItems={products.length}
            itemsPerPage={productsItemsPerPage}
            onPageChange={setProductsCurrentPage}
            onItemsPerPageChange={setProductsItemsPerPage}
            itemsPerPageOptions={[10, 20, 50, 100]}
          />
        </div>
      )}

      {/* Recommendations */}
      <TheThongTin title="💡 Gợi ý quản lý tồn kho">
        <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
          <div className="flex items-start space-x-2">
            <span className="font-semibold text-primary-600 dark:text-primary-400">•</span>
            <p>
              <strong>Tồn kho an toàn:</strong> Duy trì mức tồn kho tối thiểu 10 đơn vị cho mỗi
              sản phẩm
            </p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="font-semibold text-primary-600 dark:text-primary-400">•</span>
            <p>
              <strong>Thời gian giao hàng:</strong> Tính toán dựa trên thời gian trung bình 7 ngày
              từ nhà cung cấp
            </p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="font-semibold text-primary-600 dark:text-primary-400">•</span>
            <p>
              <strong>Kiểm tra định kỳ:</strong> Nên kiểm tra tồn kho hàng ngày và nhập hàng khi
              cần thiết
            </p>
          </div>
        </div>
      </TheThongTin>
    </div>
  )
}

