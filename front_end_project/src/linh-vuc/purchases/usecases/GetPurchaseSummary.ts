/**
 * Use Case: Get Purchase Summary
 * Lấy thông tin tổng hợp về phiếu nhập hàng
 */

import { PurchaseSummary } from '../entities/Purchase'
import { PurchaseService } from '../services/PurchaseService'

export class GetPurchaseSummaryUseCase {
  constructor(private readonly purchaseService: PurchaseService) {}

  async executeForToday(): Promise<PurchaseSummary> {
    return this.purchaseService.getTodayPurchaseSummary()
  }

  async executeForWeek(): Promise<PurchaseSummary> {
    return this.purchaseService.getWeekPurchaseSummary()
  }

  async executeForMonth(): Promise<PurchaseSummary> {
    return this.purchaseService.getMonthPurchaseSummary()
  }

  async executeForDateRange(startDate: Date, endDate: Date): Promise<PurchaseSummary> {
    return this.purchaseService.getPurchaseSummary(startDate, endDate)
  }
}
