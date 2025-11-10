/**
 * Inventory Page
 * Trang quản lý tồn kho với cảnh báo sắp hết hàng
 */

import { useEffect, useState } from 'react'
import { AlertTriangle, Package, TrendingDown } from 'lucide-react'
import { Card } from '@/ui/components/Card'
import { Table } from '@/ui/components/Table'
import { Badge } from '@/ui/components/Badge'
import { StatCard } from '@/ui/components/StatCard'
import { Product } from '@/domains/products/entities/Product'
import { InventoryAlert } from '@/domains/inventory/entities/InventoryAlert'
import { productApi } from '@/infra/api/productApi'
import { InventoryService } from '@/domains/inventory/services/InventoryService'
import { formatCurrency } from '@/infra/utils/formatters'
import toast from 'react-hot-toast'

const inventoryService = new InventoryService()

export const InventoryPage = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [alerts, setAlerts] = useState<InventoryAlert[]>([])
  const [isLoading, setIsLoading] = useState(true)

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">Đang tải...</div>
      </div>
    )
  }

  const lowStockProducts = inventoryService.getLowStockProducts(products)
  const criticalStockProducts = inventoryService.getCriticalStockProducts(products)
  const outOfStockProducts = inventoryService.getOutOfStockProducts(products)
  const totalInventoryValue = inventoryService.calculateTotalInventoryValue(products)

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
        <Badge
          variant={
            alert.alertLevel === 'out_of_stock'
              ? 'danger'
              : alert.alertLevel === 'critical'
              ? 'warning'
              : 'default'
          }
        >
          {alert.currentStock} {alert.product.unit}
        </Badge>
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
          <Badge
            variant={
              alert.alertLevel === 'out_of_stock'
                ? 'danger'
                : alert.alertLevel === 'critical'
                ? 'warning'
                : 'info'
            }
          >
            {levelText[alert.alertLevel]}
          </Badge>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Tổng giá trị tồn kho"
          value={formatCurrency(totalInventoryValue)}
          icon={Package}
          color="blue"
        />
        <StatCard
          title="Sắp hết hàng"
          value={lowStockProducts.length}
          icon={TrendingDown}
          color="yellow"
        />
        <StatCard
          title="Tồn kho rất thấp"
          value={criticalStockProducts.length}
          icon={AlertTriangle}
          color="red"
        />
        <StatCard
          title="Hết hàng"
          value={outOfStockProducts.length}
          icon={AlertTriangle}
          color="red"
        />
      </div>

      {/* Alert Section */}
      {alerts.length > 0 && (
        <Card title="⚠️ Cảnh báo tồn kho">
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Các sản phẩm sau cần được nhập thêm hàng:
            </p>
            <Table data={alerts} columns={alertColumns} />
          </div>
        </Card>
      )}

      {/* All Products Inventory */}
      <Card title="Tồn kho tất cả sản phẩm">
        <Table data={products} columns={allProductsColumns} />
      </Card>

      {/* Recommendations */}
      <Card title="💡 Gợi ý quản lý tồn kho">
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
      </Card>
    </div>
  )
}

