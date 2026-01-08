/**
 * Use Case: Get Order Summary
 * Lấy thông tin tổng hợp về đơn hàng
 */

import { OrderSummary } from '../entities/Order'
import { OrderService } from '../services/OrderService'

export class GetOrderSummaryUseCase {
  constructor(private readonly orderService: OrderService) {}

  async executeForToday(): Promise<OrderSummary> {
    return this.orderService.getTodayOrderSummary()
  }

  async executeForWeek(): Promise<OrderSummary> {
    return this.orderService.getWeekOrderSummary()
  }

  async executeForMonth(): Promise<OrderSummary> {
    return this.orderService.getMonthOrderSummary()
  }

  async executeForDateRange(startDate: Date, endDate: Date): Promise<OrderSummary> {
    return this.orderService.getOrderSummary(startDate, endDate)
  }
}
