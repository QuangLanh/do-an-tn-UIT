/**
 * Inventory Service
 * Quản lý tồn kho và cảnh báo
 */

import { Product } from '../../products/entities/Product'
import { InventoryAlert, AlertLevel } from '../entities/InventoryAlert'

export class InventoryService {
  private readonly LOW_STOCK_THRESHOLD = 10
  private readonly CRITICAL_THRESHOLD = 5

  generateInventoryAlerts(products: Product[]): InventoryAlert[] {
    return products
      .filter((product) => product.stock <= this.LOW_STOCK_THRESHOLD)
      .map((product) => ({
        id: `alert-${product.id}`,
        product,
        currentStock: product.stock,
        threshold: this.LOW_STOCK_THRESHOLD,
        alertLevel: this.determineAlertLevel(product.stock),
        suggestedReorderQuantity: this.calculateReorderQuantity(product),
        createdAt: new Date(),
      }))
  }

  private determineAlertLevel(stock: number): AlertLevel {
    if (stock === 0) return 'out_of_stock'
    if (stock <= this.CRITICAL_THRESHOLD) return 'critical'
    return 'low'
  }

  private calculateReorderQuantity(product: Product): number {
    // Giả lập tính toán dựa trên doanh số trung bình
    // Trong thực tế, cần dữ liệu lịch sử bán hàng
    const averageDailySales = this.getAverageDailySales(product)
    const leadTime = 7 // 7 ngày lead time
    const safetyStock = 10 // Tồn kho an toàn

    return Math.ceil(averageDailySales * leadTime + safetyStock)
  }

  private getAverageDailySales(product: Product): number {
    // Mock data - trong thực tế sẽ query từ database
    const categoryAverageSales: Record<string, number> = {
      'Thực phẩm khô': 5,
      'Gia vị': 3,
      'Đồ uống': 8,
      'Thực phẩm tươi sống': 10,
    }
    return categoryAverageSales[product.category] || 5
  }

  getLowStockProducts(products: Product[]): Product[] {
    return products.filter((p) => p.stock <= this.LOW_STOCK_THRESHOLD)
  }

  getCriticalStockProducts(products: Product[]): Product[] {
    return products.filter((p) => p.stock <= this.CRITICAL_THRESHOLD)
  }

  getOutOfStockProducts(products: Product[]): Product[] {
    return products.filter((p) => p.stock === 0)
  }

  calculateTotalInventoryValue(products: Product[]): number {
    return products.reduce((total, product) => {
      return total + product.importPrice * product.stock
    }, 0)
  }
}

