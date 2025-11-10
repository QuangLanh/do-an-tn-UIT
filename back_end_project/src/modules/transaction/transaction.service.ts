import { Injectable } from '@nestjs/common';
import { OrderService } from '../order/order.service';
import { PurchaseService } from '../purchase/purchase.service';

@Injectable()
export class TransactionService {
  constructor(
    private orderService: OrderService,
    private purchaseService: PurchaseService,
  ) {}

  async getSummary(from?: Date, to?: Date) {
    const orderStats = await this.orderService.getStatistics(from, to);
    const purchaseStats = await this.purchaseService.getStatistics(from, to);

    const revenue = orderStats.totalRevenue || 0;
    const orderCost = orderStats.totalCost ?? 0;
    const purchaseCost = purchaseStats.totalCost || 0;

    // Ưu tiên chi phí dựa trên sản phẩm đã bán; fallback về tổng nhập hàng nếu chưa có đủ dữ liệu
    const cost = orderCost > 0 ? orderCost : purchaseCost;
    const profit = revenue - cost;
    const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

    return {
      revenue,
      cost,
      orderCost,
      purchaseCost,
      profit,
      profitMargin: parseFloat(profitMargin.toFixed(2)),
      totalOrders: orderStats.totalOrders || 0,
      totalPurchases: purchaseStats.totalPurchases || 0,
      averageOrderValue: orderStats.averageOrderValue || 0,
      averagePurchaseValue: purchaseStats.averagePurchaseValue || 0,
      period: {
        from: from?.toISOString(),
        to: to?.toISOString(),
      },
    };
  }

  async getMonthlyData(year?: number) {
    const targetYear = year || new Date().getFullYear();
    const monthlyData = [];

    for (let month = 0; month < 12; month++) {
      const from = new Date(targetYear, month, 1);
      const to = new Date(targetYear, month + 1, 0, 23, 59, 59);

      const summary = await this.getSummary(from, to);

      monthlyData.push({
        month: month + 1,
        monthName: from.toLocaleString('default', { month: 'long' }),
        ...summary,
      });
    }

    return {
      year: targetYear,
      data: monthlyData,
    };
  }
}

