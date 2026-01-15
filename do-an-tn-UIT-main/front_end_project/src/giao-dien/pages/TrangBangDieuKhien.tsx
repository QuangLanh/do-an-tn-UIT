/**
 * Dashboard Page
 * Trang dashboard với thống kê và biểu đồ
 */

import { useEffect, useState } from 'react'
import { TheThongKe } from '@/giao-dien/components/TheThongKe'
import { TheThongTin } from '@/giao-dien/components/TheThongTin'
import { DollarSign, TrendingUp, ShoppingCart, Package, AlertTriangle, CreditCard } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { productApi } from '@/ha-tang/api/productApi'
import { orderApi } from '@/ha-tang/api/orderApi'
import { apiService } from '@/ha-tang/api'
import { InventoryService } from '@/linh-vuc/inventory/services/InventoryService'
import { Product } from '@/linh-vuc/products/entities/Product'
import { formatCurrency } from '@/ha-tang/utils/formatters'

const inventoryService = new InventoryService()

export const TrangBangDieuKhien = () => {
  const [products, setProducts] = useState<Product[]>([])
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

  useEffect(() => {
    loadData()
  }, [])

const loadData = async () => {
    try {
      setIsLoading(true)
      
      // 1. Tải danh sách sản phẩm (giữ nguyên)
      const productsData = await productApi.getAllProducts.execute()
      setProducts(productsData)

      // 2. Tải thống kê từ Dashboard API (bao gồm cả thống kê ghi nợ)
      const dashboardSummary = await apiService.dashboard.summary()
      if (dashboardSummary.debt) {
        setDebtSummary({
          totalDebtOrders: dashboardSummary.debt.totalDebtOrders || 0,
          totalDebtAmount: dashboardSummary.debt.totalDebtAmount || 0,
        })
      }
      
      // 2. Tải thông tin đơn hàng HÔM NAY (giữ nguyên)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayEnd = new Date()
      todayEnd.setHours(23, 59, 59, 999)

      const todaySummaryResponse = await apiService.transactions.summary({
        from: today.toISOString(),
        to: todayEnd.toISOString(),
      })

      setTodaySummary({
        revenue: todaySummaryResponse.revenue || 0,
        profit: todaySummaryResponse.profit || 0,
        orders: todaySummaryResponse.totalOrders || 0,
      })
      
      // 3. Tải dữ liệu biểu đồ 7 ngày (SỬA ĐOẠN NÀY)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
      sevenDaysAgo.setHours(0, 0, 0, 0)
      
      const days = []
      for (let i = 0; i < 7; i++) {
        const date = new Date(sevenDaysAgo)
        date.setDate(date.getDate() + i)
        days.push(date)
      }
      
      const salesData = []
      
      // --- BẮT ĐẦU SỬA ---
      // Thay vì gọi orderApi rồi tự cộng, ta gọi api transaction summary cho từng ngày
      // Cách này đảm bảo logic tính lợi nhuận Y HỆT như Backend
      for (const day of days) {
        const startOfDay = new Date(day);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(day);
        endOfDay.setHours(23, 59, 59, 999);

        // Gọi API thống kê cho ngày 'day'
        const dailySummary = await apiService.transactions.summary({
            from: startOfDay.toISOString(),
            to: endOfDay.toISOString()
        });
        
        // Format ngày hiển thị VN
        const year = day.getFullYear();
        const month = String(day.getMonth() + 1).padStart(2, '0');
        const dateNum = String(day.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${dateNum}`;

        salesData.push({
          date: dateStr,
          revenue: dailySummary.revenue || 0,
          profit: dailySummary.profit || 0, // Lấy trực tiếp từ Backend (đã trừ giá vốn đúng)
          orders: dailySummary.totalOrders || 0
        })
      }
      // --- KẾT THÚC SỬA ---

      setDailySales(salesData)

      // 4. Tổng kết 7 ngày (giữ nguyên)
      const summary = await apiService.transactions.summary({
        from: sevenDaysAgo.toISOString(),
        to: todayEnd.toISOString(),
      })

      setTransactionSummary({
        revenue: summary.revenue || 0,
        profit: summary.profit || 0,
        cost: summary.cost || 0,
      })
      
      // 5. Top sản phẩm (giữ nguyên logic hoặc tối ưu sau)
      const allOrders = await orderApi.getAllOrders.execute()
      const completedOrders = allOrders.filter(o => o.status === 'completed')
      const productSales = new Map()
      
      for (const order of completedOrders) {
        for (const item of order.items) {
          const productId = item.productId
          const currentSales = productSales.get(productId) || {
            productId,
            productName: item.product.name,
            quantitySold: 0,
            revenue: 0,
            profit: 0
          }
          currentSales.quantitySold += item.quantity
          currentSales.revenue += item.subtotal
          // Phần top sản phẩm này chỉ để hiển thị tương đối, có thể giữ nguyên
          currentSales.profit += (item.unitPrice - (item.product.importPrice || 0)) * item.quantity
          productSales.set(productId, currentSales)
        }
      }
      
      const topProductsData = Array.from(productSales.values())
        .sort((a, b) => b.quantitySold - a.quantitySold)
        .slice(0, 5)
      
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
                  const [y, m, d] = value.split('-');
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

