import { Injectable } from '@nestjs/common';
import { DichVuGiaoDich } from '../giao-dich/giao-dich.dich-vu';
import { DichVuDonHang } from '../don-hang/don-hang.dich-vu';
import { DichVuSanPham } from '../san-pham/san-pham.dich-vu';

@Injectable()
export class DichVuBangDieuKhien {
  constructor(
    private dichVuGiaoDich: DichVuGiaoDich,
    private dichVuDonHang: DichVuDonHang,
    private dichVuSanPham: DichVuSanPham,
  ) {}

  async getSummary() {
    // Get current month data
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const monthSummary = await this.dichVuGiaoDich.getSummary(
      firstDayOfMonth,
      lastDayOfMonth,
    );

    // Get today's data
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    const todaySummary = await this.dichVuGiaoDich.getSummary(startOfDay, endOfDay);

    // Get low stock products
    const lowStockProducts = await this.dichVuSanPham.getLowStockProducts();

    return {
      today: {
        revenue: todaySummary.revenue,
        orders: todaySummary.totalOrders,
        profit: todaySummary.profit,
      },
      thisMonth: {
        revenue: monthSummary.revenue,
        orders: monthSummary.totalOrders,
        profit: monthSummary.profit,
        profitMargin: monthSummary.profitMargin,
      },
      alerts: {
        lowStockCount: lowStockProducts.length,
        lowStockProducts: lowStockProducts.slice(0, 5).map(p => ({
          id: p._id?.toString() || p.id?.toString(),
          name: p.name,
          currentStock: p.stock,
          minStockLevel: p.minStockLevel,
        })),
      },
    };
  }

  async getTopProducts(limit: number = 10) {
    return this.dichVuDonHang.getTopProducts(limit);
  }

  async getOrdersTrend(days: number = 30) {
    const trend = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const summary = await this.dichVuGiaoDich.getSummary(date, nextDate);

      trend.push({
        date: date.toISOString().split('T')[0],
        revenue: summary.revenue,
        orders: summary.totalOrders,
        profit: summary.profit,
      });
    }

    return trend;
  }

  async getRecentActivity() {
    const recentOrders = await this.dichVuDonHang.findAll({
      limit: 5,
    });

    return {
      recentOrders: recentOrders.slice(0, 5),
    };
  }
}

