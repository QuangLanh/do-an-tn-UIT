/**
 * Report Service
 * Tạo và quản lý báo cáo
 */

import { Product } from '../../products/entities/Product'
import { DailySalesReport, ProductSalesReport, DashboardStats } from '../entities/Report'
import { OrderSummary } from '../../orders/entities/Order'

export class ReportService {
  // Generate mock data for daily sales (last 7 days)
  generateDailySalesReport(days: number = 7): DailySalesReport[] {
    const reports: DailySalesReport[] = []
    const today = new Date()

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)

      const orders = Math.floor(Math.random() * 20) + 10
      const revenue = Math.floor(Math.random() * 3000000) + 1000000
      const cost = revenue * (0.6 + Math.random() * 0.1)
      const profit = revenue - cost

      reports.push({
        date: date.toISOString().split('T')[0],
        revenue: Math.round(revenue),
        cost: Math.round(cost),
        profit: Math.round(profit),
        orders,
      })
    }

    return reports
  }

  // Generate top selling products report
  generateTopProductsReport(products: Product[], limit: number = 5): ProductSalesReport[] {
    return products
      .map((product) => {
        const quantitySold = Math.floor(Math.random() * 50) + 10
        const revenue = quantitySold * product.salePrice
        const cost = quantitySold * product.importPrice
        const profit = revenue - cost

        return {
          productId: product.id,
          productName: product.name,
          quantitySold,
          revenue,
          profit,
        }
      })
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, limit)
  }

  // Generate dashboard statistics
  generateDashboardStats(products: Product[]): DashboardStats {
    const dailyReports = this.generateDailySalesReport(30)
    const todayReport = dailyReports[dailyReports.length - 1]
    const monthReports = dailyReports

    const monthRevenue = monthReports.reduce((sum, r) => sum + r.revenue, 0)
    const monthProfit = monthReports.reduce((sum, r) => sum + r.profit, 0)
    const monthOrders = monthReports.reduce((sum, r) => sum + r.orders, 0)

    const lowStockCount = products.filter((p) => p.stock < 10).length

    return {
      todayRevenue: todayReport.revenue,
      todayProfit: todayReport.profit,
      todayOrders: todayReport.orders,
      monthRevenue,
      monthProfit,
      monthOrders,
      lowStockCount,
      totalProducts: products.length,
    }
  }

  calculateProfitMargin(revenue: number, profit: number): number {
    if (revenue === 0) return 0
    return (profit / revenue) * 100
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount)
  }

  formatNumber(num: number): string {
    return new Intl.NumberFormat('vi-VN').format(num)
  }
}

