/**
 * Report Service With Real Data
 * Tạo và quản lý báo cáo sử dụng dữ liệu thực tế từ đơn hàng
 */

import { Product } from '../../products/entities/Product'
import { Order } from '../../orders/entities/Order'
import { DailySalesReport, ProductSalesReport, DashboardStats, MonthlyReport } from '../entities/Report'

export class ReportServiceWithRealData {
  // Tạo báo cáo doanh thu theo ngày từ dữ liệu đơn hàng thực tế
  generateDailySalesReportFromOrders(orders: Order[], days: number = 7): DailySalesReport[] {
    const reports: DailySalesReport[] = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Tạo mảng ngày trong khoảng thời gian cần báo cáo
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateString = date.toISOString().split('T')[0]
      
      // Lọc đơn hàng trong ngày
      const ordersInDay = orders.filter(order => {
        const orderDate = new Date(order.createdAt)
        return orderDate.toISOString().split('T')[0] === dateString && order.status === 'completed'
      })
      
      // Tính toán doanh thu, chi phí, lợi nhuận
      let revenue = 0
      let cost = 0
      let profit = 0
      
      for (const order of ordersInDay) {
        revenue += order.finalAmount
        
        // Tính chi phí và lợi nhuận từ các sản phẩm
        for (const item of order.items) {
          const importPrice = item.product?.importPrice || (item.product as any)?.purchasePrice || 0
          const itemCost = importPrice * item.quantity
          cost += itemCost
          profit += (item.unitPrice - importPrice) * item.quantity
        }
      }
      
      reports.push({
        date: dateString,
        revenue,
        cost,
        profit,
        orders: ordersInDay.length,
      })
    }

    return reports
  }

  // Tạo báo cáo top sản phẩm bán chạy từ dữ liệu đơn hàng thực tế
  generateTopProductsReportFromOrders(orders: Order[], limit: number = 5): ProductSalesReport[] {
    // Chỉ xét các đơn hàng đã hoàn thành
    const completedOrders = orders.filter(order => order.status === 'completed')
    
    // Map để lưu thông tin bán hàng của từng sản phẩm
    const productSalesMap = new Map<string, ProductSalesReport>()
    
    // Tính toán số lượng bán, doanh thu, lợi nhuận cho từng sản phẩm
    for (const order of completedOrders) {
      for (const item of order.items) {
        const productId = item.productId
        
        // Lấy thông tin hiện tại hoặc tạo mới
        const currentSales = productSalesMap.get(productId) || {
          productId,
          productName: item.product.name,
          quantitySold: 0,
          revenue: 0,
          profit: 0,
        }
        
        // Cập nhật thông tin
        const importPrice = item.product?.importPrice || (item.product as any)?.purchasePrice || 0
        currentSales.quantitySold += item.quantity
        currentSales.revenue += item.subtotal
        currentSales.profit += (item.unitPrice - importPrice) * item.quantity
        
        productSalesMap.set(productId, currentSales)
      }
    }
    
    // Chuyển Map thành Array và sắp xếp theo số lượng bán
    return Array.from(productSalesMap.values())
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, limit)
  }

  // Tạo báo cáo tháng từ dữ liệu đơn hàng thực tế
  generateMonthlyReportFromOrders(orders: Order[], products: Product[]): MonthlyReport {
    const today = new Date()
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    
    // Lọc đơn hàng trong tháng hiện tại
    const ordersInMonth = orders.filter(order => {
      const orderDate = new Date(order.createdAt)
      return orderDate >= firstDayOfMonth && order.status === 'completed'
    })
    
    // Tính toán tổng doanh thu, chi phí, lợi nhuận
    let totalRevenue = 0
    let totalCost = 0
    let totalProfit = 0
    
    for (const order of ordersInMonth) {
      totalRevenue += order.finalAmount
      
      for (const item of order.items) {
        const importPrice = item.product?.importPrice || (item.product as any)?.purchasePrice || 0
        const itemCost = importPrice * item.quantity
        totalCost += itemCost
        totalProfit += (item.unitPrice - importPrice) * item.quantity
      }
    }
    
    // Tạo báo cáo top sản phẩm trong tháng
    const topProducts = this.generateTopProductsReportFromOrders(ordersInMonth, 10)
    
    return {
      month: `${today.getMonth() + 1}/${today.getFullYear()}`,
      totalRevenue,
      totalCost,
      totalProfit,
      totalOrders: ordersInMonth.length,
      topProducts,
    }
  }

  // Tạo thống kê dashboard từ dữ liệu đơn hàng thực tế
  generateDashboardStatsFromOrders(orders: Order[], products: Product[]): DashboardStats {
    // Tính toán thống kê cho ngày hôm nay
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    // Đơn hàng hôm nay
    const todayOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt)
      return orderDate >= today && orderDate < tomorrow && order.status === 'completed'
    })
    
    let todayRevenue = 0
    let todayProfit = 0
    
    for (const order of todayOrders) {
      todayRevenue += order.finalAmount
      
      for (const item of order.items) {
        const importPrice = item.product?.importPrice || (item.product as any)?.purchasePrice || 0
        todayProfit += (item.unitPrice - importPrice) * item.quantity
      }
    }
    
    // Tính toán thống kê cho tháng hiện tại
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    
    const monthOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt)
      return orderDate >= firstDayOfMonth && orderDate < tomorrow && order.status === 'completed'
    })
    
    let monthRevenue = 0
    let monthProfit = 0
    
    for (const order of monthOrders) {
      monthRevenue += order.finalAmount
      
      for (const item of order.items) {
        const importPrice = item.product?.importPrice || (item.product as any)?.purchasePrice || 0
        monthProfit += (item.unitPrice - importPrice) * item.quantity
      }
    }
    
    // Đếm số sản phẩm sắp hết hàng
    const lowStockCount = products.filter(p => p.stock < 10).length
    
    return {
      todayRevenue,
      todayProfit,
      todayOrders: todayOrders.length,
      monthRevenue,
      monthProfit,
      monthOrders: monthOrders.length,
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
