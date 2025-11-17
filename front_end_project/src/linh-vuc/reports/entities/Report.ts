/**
 * Report Entity
 * Báo cáo doanh thu, lợi nhuận
 */

export interface DailySalesReport {
  date: string
  revenue: number
  cost: number
  profit: number
  orders: number
}

export interface ProductSalesReport {
  productId: string
  productName: string
  quantitySold: number
  revenue: number
  profit: number
}

export interface MonthlyReport {
  month: string
  totalRevenue: number
  totalCost: number
  totalProfit: number
  totalOrders: number
  topProducts: ProductSalesReport[]
}

export interface DashboardStats {
  todayRevenue: number
  todayProfit: number
  todayOrders: number
  monthRevenue: number
  monthProfit: number
  monthOrders: number
  lowStockCount: number
  totalProducts: number
}

