/**
 * Report API
 * Factory pattern để tạo các service cho Reports
 */

import { ReportService } from '@/domains/reports/services/ReportService'
import { ReportServiceWithRealData } from '@/domains/reports/services/ReportServiceWithRealData'
import { orderApi } from './orderApi'
import { productApi } from './productApi'

// Singleton instances
const reportService = new ReportService()
const reportServiceWithRealData = new ReportServiceWithRealData()

// Hàm helper để lấy dữ liệu đơn hàng và sản phẩm
const getOrdersAndProducts = async () => {
  const orders = await orderApi.getAllOrders.execute()
  const products = await productApi.getAllProducts.execute()
  return { orders, products }
}

export const reportApi = {
  // Các service sử dụng dữ liệu giả lập (mock data)
  mockService: reportService,
  
  // Các service sử dụng dữ liệu thực tế từ đơn hàng
  realDataService: reportServiceWithRealData,
  
  // Các phương thức tiện ích
  async getDailySalesReport(days: number = 7) {
    const { orders } = await getOrdersAndProducts()
    return reportServiceWithRealData.generateDailySalesReportFromOrders(orders, days)
  },
  
  async getTopProductsReport(limit: number = 5) {
    const { orders } = await getOrdersAndProducts()
    return reportServiceWithRealData.generateTopProductsReportFromOrders(orders, limit)
  },
  
  async getMonthlyReport() {
    const { orders, products } = await getOrdersAndProducts()
    return reportServiceWithRealData.generateMonthlyReportFromOrders(orders, products)
  },
  
  async getDashboardStats() {
    const { orders, products } = await getOrdersAndProducts()
    return reportServiceWithRealData.generateDashboardStatsFromOrders(orders, products)
  },
  
  // Các hàm tiện ích khác
  calculateProfitMargin: reportService.calculateProfitMargin,
  formatCurrency: reportService.formatCurrency,
  formatNumber: reportService.formatNumber,
}
