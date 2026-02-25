/**
 * Dashboard Page
 * Trang dashboard với thống kê và biểu đồ
 */

import { useEffect, useState, useRef } from 'react'
import { TheThongKe } from '@/giao-dien/components/TheThongKe'
import { TheThongTin } from '@/giao-dien/components/TheThongTin'
import { DollarSign, TrendingUp, ShoppingCart, Package, AlertTriangle, CreditCard } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { apiService } from '@/ha-tang/api'
import { InventoryService } from '@/linh-vuc/inventory/services/InventoryService'
import { Product } from '@/linh-vuc/products/entities/Product'
import { formatCurrency } from '@/ha-tang/utils/formatters'
import { useProductStore } from '@/kho-trang-thai/khoSanPham'

const inventoryService = new InventoryService()

export const TrangBangDieuKhien = () => {
  const { products, loadProducts } = useProductStore()
  const [dailySales, setDailySales] = useState<any[]>([])
  const [topProducts, setTopProducts] = useState<any[]>([])
  const [transactionSummary, setTransactionSummary] = useState<{
    revenue: number
    profit: number
    cost: number
  }>({ revenue: 0, profit: 0, cost: 0 })
  const [todaySummary, setTodaySummary] = useState<{
    revenue: number
    profit: number
    orders: number
  }>({ revenue: 0, profit: 0, orders: 0 })
  const [debtSummary, setDebtSummary] = useState<{
    totalDebtOrders: number
    totalDebtAmount: number
  }>({ totalDebtOrders: 0, totalDebtAmount: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const hasLoadedRef = useRef(false)

  useEffect(() => {
    if (hasLoadedRef.current) return
    hasLoadedRef.current = true
    loadData()
  }, [])

const loadData = async () => {
    try {
      setIsLoading(true)

      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayEnd = new Date()
      todayEnd.setHours(23, 59, 59, 999)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
      sevenDaysAgo.setHours(0, 0, 0, 0)

      const [_, dashboardSummary, todaySummaryResponse, dailySummary, summary, topProductsData] = await Promise.all([
        loadProducts(),
        apiService.dashboard.summary(),
        apiService.transactions.summary({ from: today.toISOString(), to: todayEnd.toISOString() }),
        apiService.transactions.dailySummary({
          from: sevenDaysAgo.toISOString(),
          to: todayEnd.toISOString(),
        }),
        apiService.transactions.summary({
          from: sevenDaysAgo.toISOString(),
          to: todayEnd.toISOString(),
        }),
        apiService.dashboard.topProducts(5),
      ])
      if (dashboardSummary.debt) {
        setDebtSummary({
          totalDebtOrders: dashboardSummary.debt.totalDebtOrders || 0,
          totalDebtAmount: dashboardSummary.debt.totalDebtAmount || 0,
        })
      }
      setTodaySummary({
        revenue: todaySummaryResponse.revenue || 0,
        profit: todaySummaryResponse.profit || 0,
        orders: todaySummaryResponse.totalOrders || 0,
      })

      // 3. Dữ liệu biểu đồ 7 ngày (đã được backend trả sẵn)
      setDailySales(dailySummary || [])

      // 4. Tổng kết 7 ngày
      setTransactionSummary({
        revenue: summary.revenue || 0,
        profit: summary.profit || 0,
        cost: summary.cost || 0,
      })
      
      setTopProducts(topProductsData)

    } catch (error) {
      console.error('Failed to load data:', error)
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

  // Fallback to mock data if real data is not available
  const todayRevenue = todaySummary.revenue || 0
  const todayProfit = todaySummary.profit || 0
  const todayOrders = todaySummary.orders || 0
  const lowStockCount = inventoryService.getLowStockProducts(products).length

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Tổng quan hệ thống quản lý tạp hóa
        </p>
      </div>

      {/* Stats TheThongTins */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <TheThongKe
          title="Doanh thu hôm nay"
          value={formatCurrency(todayRevenue)}
          icon={DollarSign}
          color="green"
        />
        <TheThongKe
          title="Lợi nhuận hôm nay"
          value={formatCurrency(todayProfit)}
          icon={TrendingUp}
          color="blue"
        />
        <TheThongKe
          title="Đơn hàng hôm nay"
          value={todayOrders}
          icon={ShoppingCart}
          color="purple"
        />
        <TheThongKe
          title="Đơn hàng ghi nợ"
          value={`${debtSummary.totalDebtOrders} đơn - ${formatCurrency(debtSummary.totalDebtAmount)}`}
          icon={CreditCard}
          color={debtSummary.totalDebtOrders > 0 ? 'yellow' : 'green'}
        />
        <TheThongKe
          title="Sản phẩm sắp hết"
          value={lowStockCount}
          icon={AlertTriangle}
          color={lowStockCount > 0 ? 'red' : 'green'}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <TheThongTin title="Doanh thu 7 ngày gần nhất">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailySales}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis 
                dataKey="date" 
                stroke="#6B7280"
              tick={{ fill: '#6B7280' }}
              // Thêm dòng này:
              tickFormatter={(value) => {
                const [_y, m, d] = value.split('-');
                return `${d}/${m}`;
              }}
              />
              <YAxis 
                stroke="#6B7280"
                tick={{ fill: '#6B7280' }}
                tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
              />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Doanh thu"
              />
              <Line 
                type="monotone" 
                dataKey="profit" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Lợi nhuận"
              />
            </LineChart>
          </ResponsiveContainer>
        </TheThongTin>

        {/* Top Products Chart */}
        <TheThongTin title="Top 5 sản phẩm bán chạy">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProducts}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis 
                dataKey="productName" 
                stroke="#6B7280"
                tick={{ fill: '#6B7280', fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis 
                stroke="#6B7280"
                tick={{ fill: '#6B7280' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Legend />
              <Bar 
                dataKey="quantitySold" 
                fill="#8b5cf6" 
                name="Số lượng bán"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </TheThongTin>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <TheThongTin>
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-green-100 dark:bg-green-900 rounded-full">
              <DollarSign className="text-green-600 dark:text-green-300" size={32} />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tổng doanh thu</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(transactionSummary.revenue)}
              </p>
            </div>
          </div>
        </TheThongTin>

        <TheThongTin>
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-full">
              <TrendingUp className="text-blue-600 dark:text-blue-300" size={32} />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tổng lợi nhuận</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(transactionSummary.profit)}
              </p>
            </div>
          </div>
        </TheThongTin>

        <TheThongTin>
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-purple-100 dark:bg-purple-900 rounded-full">
              <Package className="text-purple-600 dark:text-purple-300" size={32} />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tổng sản phẩm</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {products.length}
              </p>
            </div>
          </div>
        </TheThongTin>
      </div>
    </div>
  )
}

