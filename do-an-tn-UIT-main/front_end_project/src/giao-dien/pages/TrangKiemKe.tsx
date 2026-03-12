/**
 * Inventory Page
 * Trang quản lý tồn kho với cảnh báo sắp hết hàng
 * Có tính năng: Tạo phiếu nhập hàng tự động từ gợi ý (select one / select all)
 */

import { useEffect, useState, useMemo, useCallback } from 'react'
import { AlertTriangle, Package, TrendingDown, Truck, FilePlus, Clock, XCircle, Trash2 } from 'lucide-react'
import { TheThongTin } from '@/giao-dien/components/TheThongTin'
import { BangDuLieu } from '@/giao-dien/components/BangDuLieu'
import { HuyHieu } from '@/giao-dien/components/HuyHieu'
import { HopThoai } from '@/giao-dien/components/HopThoai'
import { TheThongKe } from '@/giao-dien/components/TheThongKe'
import { PhanTrang } from '@/giao-dien/components/PhanTrang'
import { NutBam } from '@/giao-dien/components/NutBam'
import { Product } from '@/linh-vuc/products/entities/Product'
import { InventoryAlert } from '@/linh-vuc/inventory/entities/InventoryAlert'
import { purchaseApi } from '@/ha-tang/api/purchaseApi'
import { supplierApi } from '@/ha-tang/api/supplierApi'
import { InventoryService } from '@/linh-vuc/inventory/services/InventoryService'
import { formatCurrency } from '@/ha-tang/utils/formatters'
import { CreatePurchaseDto } from '@/linh-vuc/purchases/entities/Purchase'
import { apiService } from '@/ha-tang/api'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/kho-trang-thai/khoXacThuc'
import { useProductStore } from '@/kho-trang-thai/khoSanPham'
import type { PurchaseRecommendation, PurchaseRecommendationItem } from '@/linh-vuc/purchases/entities/PurchaseRecommendation'

const inventoryService = new InventoryService()

/** Chuyển gợi ý backend sang InventoryAlert (dùng chung logic với TrangTaoNhapHang) */
function mapRecommendationsToAlerts(
  recs: PurchaseRecommendation,
  products: Product[]
): InventoryAlert[] {
  const all: PurchaseRecommendationItem[] = [
    ...(recs.highPriority ?? []),
    ...(recs.mediumPriority ?? []),
    ...(recs.lowPriority ?? []),
  ]
  const productMap = new Map<string, Product>()
  for (const p of products) {
    const key = (p.id ?? (p as any)._id)?.toString()
    if (key) productMap.set(key, p)
  }
  const mapPriority = (p: string): InventoryAlert['alertLevel'] => {
    if (p === 'high') return 'critical'
    return 'low'
  }
  return all.map((item) => {
    const product =
      productMap.get(item.productId) ??
      ({
        id: item.productId,
        _id: item.productId,
        name: item.productName,
        category: '',
        unit: 'cái',
        importPrice: item.suggestedPurchasePrice ?? 0,
        supplier: 'Chưa có NCC',
        stock: item.currentStock,
      } as unknown as Product)
    return {
      id: `alert-${item.productId}`,
      product,
      currentStock: item.currentStock,
      threshold: item.minStockLevel,
      alertLevel: mapPriority(item.priority),
      suggestedReorderQuantity: item.recommendedQuantity,
      createdAt: new Date(),
    }
  })
}

export const TrangKiemKe = () => {
  const { products, isLoading, loadProducts } = useProductStore()
  const [alerts, setAlerts] = useState<InventoryAlert[]>([])
  const [alertsCurrentPage, setAlertsCurrentPage] = useState(1)
  const [alertsItemsPerPage, setAlertsItemsPerPage] = useState(10)
  const [productsCurrentPage, setProductsCurrentPage] = useState(1)
  const [productsItemsPerPage, setProductsItemsPerPage] = useState(10)
  const [selectedAlertIds, setSelectedAlertIds] = useState<Set<string>>(new Set())
  const [isCreating, setIsCreating] = useState(false)
  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const [previewPurchases, setPreviewPurchases] = useState<CreatePurchaseDto[]>([])
  const [previewSupplierIds, setPreviewSupplierIds] = useState<string[]>([])
  const [suppliers, setSuppliers] = useState<{ id: string; name: string; phone: string }[]>([])
  const [expiryWarnings, setExpiryWarnings] = useState<{
    expiredCount: number
    expiringCount: number
    criticalCount?: number
    expiredItems: any[]
    expiringItems: any[]
    criticalItems?: any[]
  }>({ expiredCount: 0, expiringCount: 0, expiredItems: [], expiringItems: [] })
  const [batchDetailProduct, setBatchDetailProduct] = useState<Product | null>(null)
  const [batchDetail, setBatchDetail] = useState<any[]>([])
  const [expiryStatusMap, setExpiryStatusMap] = useState<Record<string, { status: string; expiredQty: number; nearExpiryQty: number }>>({})
  const [removingExpiredId, setRemovingExpiredId] = useState<string | null>(null)
  const { hasPermission } = useAuthStore()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [data, recs, , statusMap] = await Promise.all([
        loadProducts(),
        purchaseApi.getRecommendations().catch(() => null),
        apiService.purchases.expiryWarnings(7)
          .then((w: any) => setExpiryWarnings(w))
          .catch(() => {}),
        apiService.purchases.expiryStatus(7).catch(() => ({})),
      ])
      setExpiryStatusMap(statusMap || {})
      // Dùng gợi ý từ backend (cùng API với TrangTaoNhapHang) thay vì tính local
      let generatedAlerts: InventoryAlert[]
      try {
        generatedAlerts = recs && recs.highPriority
          ? mapRecommendationsToAlerts(recs, data ?? [])
          : inventoryService.generateInventoryAlerts(data ?? [])
      } catch (mapErr) {
        generatedAlerts = inventoryService.generateInventoryAlerts(data ?? [])
      }
      setAlerts(generatedAlerts)
    } catch (error) {
      toast.error('Không thể tải dữ liệu tồn kho')
      setAlerts([])
    }
  }

  const handleRemoveExpired = async (productId: string) => {
    if (!hasPermission('update_product')) {
      toast.error('Bạn không có quyền thao tác')
      return
    }
    if (!confirm('Xác nhận loại bỏ hàng hết hạn khỏi tồn kho?')) return
    try {
      setRemovingExpiredId(productId)
      const res = await apiService.purchases.removeExpired(productId)
      toast.success(`Đã loại bỏ ${(res as any).removedQty} đơn vị hàng hết hạn: ${(res as any).productName}`)
      loadData()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Không thể loại bỏ')
    } finally {
      setRemovingExpiredId(null)
    }
  }

  const toggleSelect = useCallback((alertId: string) => {
    setSelectedAlertIds((prev) => {
      const next = new Set(prev)
      if (next.has(alertId)) next.delete(alertId)
      else next.add(alertId)
      return next
    })
  }, [])

  const toggleSelectAll = useCallback(() => {
    if (selectedAlertIds.size >= alerts.length) {
      setSelectedAlertIds(new Set())
    } else {
      setSelectedAlertIds(new Set(alerts.map((a) => a.id)))
    }
  }, [alerts, selectedAlertIds.size])

  const buildPurchaseDtoFromAlerts = useCallback(
    (alertsToUse: InventoryAlert[]): CreatePurchaseDto => {
      const supplier = alertsToUse[0].product.supplier?.trim() || 'Chưa có NCC'
      const items = alertsToUse.map((alert) => {
        const qty = alert.suggestedReorderQuantity
        const price = alert.product.importPrice
        return {
          id: '',
          productId: alert.product.id,
          product: alert.product,
          quantity: qty,
          unitPrice: price,
          subtotal: qty * price,
        }
      })
      const totalAmount = items.reduce((sum, i) => sum + i.subtotal, 0)
      return {
        supplierName: supplier,
        items,
        totalAmount,
        notes: 'Tạo từ gợi ý tồn kho',
      }
    },
    []
  )

  const openPreviewModal = useCallback(
    async (alertsToShow: InventoryAlert[]) => {
      if (!hasPermission('create_purchase')) {
        toast.error('Bạn không có quyền tạo phiếu nhập')
        return
      }
      if (alertsToShow.length === 0) {
        toast.error('Vui lòng chọn ít nhất một sản phẩm')
        return
      }
      const suppliersList = await supplierApi.getAll.execute().then((d: any) => d || []).catch(() => [])
      setSuppliers(suppliersList)
      const bySupplier = new Map<string, InventoryAlert[]>()
      for (const alert of alertsToShow) {
        const key = alert.product.supplier?.trim() || 'Chưa có NCC'
        if (!bySupplier.has(key)) bySupplier.set(key, [])
        bySupplier.get(key)!.push(alert)
      }
      const dtos: CreatePurchaseDto[] = []
      const initialSupplierIds: string[] = []
      for (const [, group] of bySupplier) {
        dtos.push(buildPurchaseDtoFromAlerts(group))
        const productSupplier = group[0].product.supplier?.trim() || ''
        const matched = suppliersList.find(
          (s: any) => (s.name || '').toLowerCase() === productSupplier.toLowerCase()
        )
        initialSupplierIds.push((matched as any)?.id || (matched as any)?._id || '')
      }
      setPreviewPurchases(dtos)
      setPreviewSupplierIds(initialSupplierIds)
      setPreviewModalOpen(true)
    },
    [buildPurchaseDtoFromAlerts, hasPermission]
  )

  const createFromOneAlert = useCallback(
    (alert: InventoryAlert) => {
      openPreviewModal([alert])
    },
    [openPreviewModal]
  )

  const createFromSelected = useCallback(() => {
    const selectedAlerts = alerts.filter((a) => selectedAlertIds.has(a.id))
    openPreviewModal(selectedAlerts)
  }, [alerts, selectedAlertIds, openPreviewModal])

  const closePreviewModal = useCallback(() => {
    setPreviewModalOpen(false)
    setPreviewPurchases([])
    setPreviewSupplierIds([])
  }, [])

  const setSupplierForPurchase = useCallback((index: number, supplierId: string) => {
    setPreviewSupplierIds((prev) => {
      const next = [...prev]
      next[index] = supplierId
      return next
    })
  }, [])

  const confirmCreatePurchases = useCallback(async () => {
    if (previewPurchases.length === 0) return
    const missingSupplier = previewSupplierIds.some((id, i) => !id?.trim())
    if (missingSupplier) {
      toast.error('Vui lòng chọn nhà cung cấp cho tất cả phiếu nhập')
      return
    }
    try {
      setIsCreating(true)
      for (let i = 0; i < previewPurchases.length; i++) {
        const dto = { ...previewPurchases[i], supplierId: previewSupplierIds[i] }
        await purchaseApi.createPurchase.execute(dto)
      }
      toast.success(
        previewPurchases.length === 1
          ? 'Đã tạo phiếu nhập hàng'
          : `Đã tạo ${previewPurchases.length} phiếu nhập hàng`
      )
      setSelectedAlertIds(new Set())
      closePreviewModal()
      await loadData()
    } catch (err: any) {
      toast.error(err?.message || 'Không thể tạo phiếu nhập')
    } finally {
      setIsCreating(false)
    }
  }, [previewPurchases, previewSupplierIds, closePreviewModal])

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

  const handleViewBatchDetail = useCallback(async (product: Product) => {
    const pid = product.id || (product as any)._id
    if (!pid) return
    try {
      const batches = await apiService.purchases.batchesByProduct(String(pid))
      setBatchDetail(Array.isArray(batches) ? batches : [])
      setBatchDetailProduct(product)
    } catch {
      toast.error('Không thể tải chi tiết lô')
      setBatchDetail([])
      setBatchDetailProduct(null)
    }
  }, [])

  const closeBatchDetail = useCallback(() => {
    setBatchDetailProduct(null)
    setBatchDetail([])
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">Đang tải...</div>
      </div>
    )
  }

  const alertColumns = [
    {
      header: 'Chọn',
      className: 'w-12',
      accessor: (alert: InventoryAlert) => (
        <input
          type="checkbox"
          checked={selectedAlertIds.has(alert.id)}
          onChange={() => toggleSelect(alert.id)}
          onClick={(e) => e.stopPropagation()}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          aria-label={`Chọn ${alert.product.name}`}
        />
      ),
    },
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
    {
      header: 'Thao tác',
      className: 'w-40',
      accessor: (alert: InventoryAlert) => (
        <NutBam
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            createFromOneAlert(alert)
          }}
          disabled={isCreating}
          title="Tạo phiếu nhập hàng cho sản phẩm này"
        >
          <Truck size={16} className="mr-1 inline" />
          Tạo phiếu nhập
        </NutBam>
      ),
    },
  ]

  const getExpiryBadge = (product: Product) => {
    const pid = product.id || (product as any)._id
    const info = pid ? expiryStatusMap[String(pid)] : null
    if (!info) return <HuyHieu variant="default">Bình thường</HuyHieu>
    if (info.status === 'expired') return <HuyHieu variant="danger">Đã hết hạn</HuyHieu>
    if (info.status === 'critical') return <HuyHieu variant="danger">Cận hạn ≤7 ngày</HuyHieu>
    if (info.status === 'near_expiry') return <HuyHieu variant="warning">Sắp hết hạn</HuyHieu>
    return <HuyHieu variant="success">Bình thường</HuyHieu>
  }

  const getBatchStatusBadge = (status: string) => {
    if (status === 'expired') return <HuyHieu variant="danger">Đã hết hạn</HuyHieu>
    if (status === 'critical') return <HuyHieu variant="danger">Cận hạn</HuyHieu>
    if (status === 'near_expiry') return <HuyHieu variant="warning">Sắp hết hạn</HuyHieu>
    return <HuyHieu variant="success">Bình thường</HuyHieu>
  }

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
      header: 'Trạng thái HSD',
      accessor: (product: Product) => getExpiryBadge(product),
    },
    {
      header: 'Giá trị tồn',
      accessor: (product: Product) => formatCurrency(product.importPrice * product.stock),
    },
    { header: 'Nhà cung cấp', accessor: 'supplier' as keyof Product },
    {
      header: 'Thao tác',
      accessor: (product: Product) => {
        const pid = product.id || (product as any)._id
        const info = pid ? expiryStatusMap[String(pid)] : null
        const hasExpired = info?.status === 'expired' && info?.expiredQty > 0
        if (!hasExpired) return null
        return (
          <NutBam
            size="sm"
            variant="secondary"
            onClick={() => handleRemoveExpired(String(pid))}
            disabled={removingExpiredId === String(pid)}
            title="Loại bỏ hàng hết hạn khỏi tồn kho"
          >
            <Trash2 size={14} className="mr-1 inline" />
            Loại bỏ hàng hết hạn
          </NutBam>
        )
      },
    },
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
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
          title="Cận hạn (≤7 ngày)"
          value={expiryWarnings.criticalCount ?? 0}
          icon={AlertTriangle}
          color={(expiryWarnings.criticalCount ?? 0) > 0 ? 'red' : 'green'}
        />
        <TheThongKe
          title="Sắp hết hạn (7-30 ngày)"
          value={expiryWarnings.expiringCount}
          icon={Clock}
          color={expiryWarnings.expiringCount > 0 ? 'yellow' : 'green'}
        />
        <TheThongKe
          title="Đã hết hạn"
          value={expiryWarnings.expiredCount}
          icon={XCircle}
          color={expiryWarnings.expiredCount > 0 ? 'red' : 'green'}
        />
      </div>

      {/* Expiry Warnings Section */}
      {(expiryWarnings.expiredCount > 0 || expiryWarnings.expiringCount > 0 || (expiryWarnings.criticalCount ?? 0) > 0) && (
        <TheThongTin title="⏰ Cảnh báo hạn sử dụng">
          <div className="space-y-4">
            {expiryWarnings.expiredItems.length > 0 && (
              <div>
                <h3 className="font-semibold text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
                  <XCircle size={16} /> Sản phẩm đã hết hạn ({expiryWarnings.expiredItems.length})
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-red-50 dark:bg-red-900/20">
                        <th className="text-left py-2 px-3 border border-red-200 dark:border-red-800">Sản phẩm</th>
                        <th className="text-left py-2 px-3 border border-red-200 dark:border-red-800">Số lượng</th>
                        <th className="text-left py-2 px-3 border border-red-200 dark:border-red-800">Phiếu nhập</th>
                        <th className="text-left py-2 px-3 border border-red-200 dark:border-red-800">Ngày HSD</th>
                        <th className="text-left py-2 px-3 border border-red-200 dark:border-red-800">Số lô</th>
                        <th className="text-left py-2 px-3 border border-red-200 dark:border-red-800">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expiryWarnings.expiredItems.map((item: any, i: number) => (
                        <tr key={i} className="border-b border-red-100 dark:border-red-900/30">
                          <td className="py-2 px-3 border border-red-100 dark:border-red-900/30 font-medium">{item.productName}</td>
                          <td className="py-2 px-3 border border-red-100 dark:border-red-900/30 font-semibold">{item.quantity ?? '—'}</td>
                          <td className="py-2 px-3 border border-red-100 dark:border-red-900/30 text-gray-600 dark:text-gray-400">{item.purchaseNumber}</td>
                          <td className="py-2 px-3 border border-red-100 dark:border-red-900/30">{new Date(item.expiryDate).toLocaleDateString('vi-VN')}</td>
                          <td className="py-2 px-3 border border-red-100 dark:border-red-900/30">{item.lotNumber || '—'}</td>
                          <td className="py-2 px-3 border border-red-100 dark:border-red-900/30">
                            <HuyHieu variant="danger">Đã hết hạn</HuyHieu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {expiryWarnings.expiringItems.length > 0 && (
              <div>
                <h3 className="font-semibold text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-2">
                  <Clock size={16} /> Sản phẩm sắp hết hạn ({expiryWarnings.expiringItems.length})
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-amber-50 dark:bg-amber-900/20">
                        <th className="text-left py-2 px-3 border border-amber-200 dark:border-amber-800">Sản phẩm</th>
                        <th className="text-left py-2 px-3 border border-amber-200 dark:border-amber-800">Số lượng</th>
                        <th className="text-left py-2 px-3 border border-amber-200 dark:border-amber-800">Phiếu nhập</th>
                        <th className="text-left py-2 px-3 border border-amber-200 dark:border-amber-800">Ngày HSD</th>
                        <th className="text-left py-2 px-3 border border-amber-200 dark:border-amber-800">Còn lại</th>
                        <th className="text-left py-2 px-3 border border-amber-200 dark:border-amber-800">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expiryWarnings.expiringItems.map((item: any, i: number) => (
                        <tr key={i} className="border-b border-amber-100 dark:border-amber-900/30">
                          <td className="py-2 px-3 border border-amber-100 dark:border-amber-900/30 font-medium">{item.productName}</td>
                          <td className="py-2 px-3 border border-amber-100 dark:border-amber-900/30 font-semibold">{item.quantity ?? '—'}</td>
                          <td className="py-2 px-3 border border-amber-100 dark:border-amber-900/30 text-gray-600 dark:text-gray-400">{item.purchaseNumber}</td>
                          <td className="py-2 px-3 border border-amber-100 dark:border-amber-900/30">{new Date(item.expiryDate).toLocaleDateString('vi-VN')}</td>
                          <td className="py-2 px-3 border border-amber-100 dark:border-amber-900/30 font-semibold text-amber-600 dark:text-amber-400">{item.daysUntilExpiry} ngày</td>
                          <td className="py-2 px-3 border border-amber-100 dark:border-amber-900/30">
                            <HuyHieu variant={item.status === 'critical' ? 'danger' : 'warning'}>
                              {item.status === 'critical' ? 'Cận hạn' : 'Sắp hết hạn'}
                            </HuyHieu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </TheThongTin>
      )}

      {/* Alert Section */}
      {alerts.length > 0 && (
        <>
          <TheThongTin title="⚠️ Cảnh báo tồn kho">
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Các sản phẩm sau cần được nhập thêm hàng:
              </p>
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={alerts.length > 0 && selectedAlertIds.size === alerts.length}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Chọn tất cả
                  </span>
                </label>
                <NutBam
                  onClick={createFromSelected}
                  disabled={isCreating || selectedAlertIds.size === 0}
                  title="Tạo phiếu nhập hàng từ các sản phẩm đã chọn (nhóm theo nhà cung cấp)"
                >
                  <FilePlus size={18} className="mr-2 inline" />
                  Tạo phiếu nhập hàng từ gợi ý
                  {selectedAlertIds.size > 0 && (
                    <span className="ml-2 text-xs opacity-90">({selectedAlertIds.size})</span>
                  )}
                </NutBam>
              </div>
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
        <BangDuLieu
          data={paginatedProducts}
          columns={allProductsColumns}
          onRowClick={(product) => handleViewBatchDetail(product)}
        />
      </TheThongTin>

      {/* Modal chi tiết lô hàng */}
      <HopThoai
        isOpen={!!batchDetailProduct}
        onClose={closeBatchDetail}
        title={`Chi tiết lô hàng: ${batchDetailProduct?.name || ''}`}
        size="lg"
      >
        <div className="space-y-4">
          {batchDetailProduct && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Tổng tồn kho: <strong>{batchDetailProduct.stock} {batchDetailProduct.unit}</strong>
            </p>
          )}
          {batchDetail.length === 0 ? (
            <p className="text-sm text-gray-500">Chưa có thông tin lô hàng</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-700">
                    <th className="text-left py-2 px-3 border">Số lượng</th>
                    <th className="text-left py-2 px-3 border">Ngày SX</th>
                    <th className="text-left py-2 px-3 border">Ngày HSD</th>
                    <th className="text-left py-2 px-3 border">Còn lại</th>
                    <th className="text-left py-2 px-3 border">Phiếu nhập</th>
                    <th className="text-left py-2 px-3 border">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {batchDetail.map((b: any, i: number) => (
                    <tr key={i} className="border-b border-gray-200 dark:border-gray-600">
                      <td className="py-2 px-3 border font-medium">{b.quantity}</td>
                      <td className="py-2 px-3 border">{b.manufactureDate ? new Date(b.manufactureDate).toLocaleDateString('vi-VN') : '—'}</td>
                      <td className="py-2 px-3 border">{b.expiryDate ? new Date(b.expiryDate).toLocaleDateString('vi-VN') : '—'}</td>
                      <td className="py-2 px-3 border">{b.daysUntilExpiry != null ? `${b.daysUntilExpiry} ngày` : '—'}</td>
                      <td className="py-2 px-3 border text-gray-600 dark:text-gray-400">{b.purchaseNumber || '—'}</td>
                      <td className="py-2 px-3 border">{getBatchStatusBadge(b.status || 'normal')}</td>
                    </tr>
                  ))}
                  {batchDetailProduct && (() => {
                    const sumFromBatches = batchDetail.reduce((s: number, b: any) => s + Number(b.quantity || 0), 0)
                    const orphanQty = Math.max(0, (batchDetailProduct.stock ?? 0) - sumFromBatches)
                    if (orphanQty <= 0) return null
                    return (
                      <tr key="orphan" className="border-b border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
                        <td className="py-2 px-3 border font-medium">{orphanQty}</td>
                        <td className="py-2 px-3 border">—</td>
                        <td className="py-2 px-3 border">—</td>
                        <td className="py-2 px-3 border">—</td>
                        <td className="py-2 px-3 border text-gray-500">—</td>
                        <td className="py-2 px-3 border">
                          <span title="Tồn kho từ trước khi áp dụng quản lý lô, không có thông tin hạn sử dụng">
                          <HuyHieu variant="warning">Chưa có thông tin lô</HuyHieu>
                        </span>
                        </td>
                      </tr>
                    )
                  })()}
                </tbody>
              </table>
            </div>
          )}
          {batchDetailProduct && (() => {
            const sumFromBatches = batchDetail.reduce((s: number, b: any) => s + Number(b.quantity || 0), 0)
            const orphanQty = Math.max(0, (batchDetailProduct.stock ?? 0) - sumFromBatches)
            if (orphanQty <= 0) return null
            return (
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  ⚠️ <strong>{orphanQty} {batchDetailProduct.unit}</strong> không có thông tin lô (tồn kho từ trước khi áp dụng quản lý lô). 
                  Không xác định được hạn sử dụng — nên ưu tiên bán hoặc kiểm tra.
                </p>
              </div>
            )
          })()}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              💡 Gợi ý xử lý hàng cận hạn: Giảm giá bán nhanh • Trả nhà cung cấp • Loại bỏ khỏi tồn kho
            </p>
          </div>
        </div>
      </HopThoai>

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

      {/* Modal xem trước phiếu nhập hàng */}
      <HopThoai
        isOpen={previewModalOpen}
        onClose={closePreviewModal}
        title="Xem trước phiếu nhập hàng"
        size="xl"
      >
        <div className="space-y-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Kiểm tra thông tin bên dưới, sau đó bấm <strong>Nhập hàng</strong> để tạo phiếu.
          </p>
          {previewPurchases.map((purchase, index) => (
            <div
              key={index}
              className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50"
            >
              <div className="flex items-center gap-4 mb-3">
                <h4 className="font-semibold text-gray-900 dark:text-white shrink-0">
                  {previewPurchases.length > 1 ? `Phiếu ${index + 1} — ` : ''}Nhà cung cấp
                </h4>
                <select
                  value={previewSupplierIds[index] || ''}
                  onChange={(e) => setSupplierForPurchase(index, e.target.value)}
                  className="flex-1 max-w-xs p-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="">-- Chọn nhà cung cấp --</option>
                  {suppliers.map((s) => {
                    const sId = (s as any).id || (s as any)._id
                    return (
                      <option key={sId} value={sId}>
                        {s.name} - {s.phone}
                      </option>
                    )
                  })}
                </select>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-600">
                      <th className="text-left py-2 px-2">Sản phẩm</th>
                      <th className="text-right py-2 px-2">Số lượng</th>
                      <th className="text-right py-2 px-2">Đơn giá</th>
                      <th className="text-right py-2 px-2">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchase.items?.map((item, i) => (
                      <tr key={i} className="border-b border-gray-100 dark:border-gray-600/50">
                        <td className="py-2 px-2">{item.product?.name ?? '—'}</td>
                        <td className="text-right py-2 px-2">{item.quantity}</td>
                        <td className="text-right py-2 px-2">{formatCurrency(item.unitPrice)}</td>
                        <td className="text-right py-2 px-2 font-medium">{formatCurrency(item.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 text-right">
                <span className="font-semibold text-gray-900 dark:text-white">
                  Tổng: {formatCurrency(purchase.totalAmount ?? 0)}
                </span>
              </div>
            </div>
          ))}
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-200 dark:border-gray-600">
            <NutBam variant="secondary" onClick={closePreviewModal}>
              Hủy
            </NutBam>
            <NutBam
              onClick={confirmCreatePurchases}
              disabled={isCreating}
              isLoading={isCreating}
            >
              <Truck size={18} className="mr-2 inline" />
              Nhập hàng
            </NutBam>
          </div>
        </div>
      </HopThoai>
    </div>
  )
}

