import { Injectable } from '@nestjs/common';
import { DichVuDonHang } from '../don-hang/don-hang.dich-vu';
import { DichVuNhapHang } from '../nhap-hang/nhap-hang.dich-vu';

@Injectable()
export class DichVuGiaoDich {
  constructor(
    private dichVuDonHang: DichVuDonHang,
    private dichVuNhapHang: DichVuNhapHang,
  ) {}

  // Hàm helper để tạo ngày chuẩn giờ VN (UTC+7)
  private createVNDate(year: number, month: number, day: number, type: 'start' | 'end') {
    // Tháng trong JS bắt đầu từ 0 (0 = tháng 1)
    // Format string: YYYY-MM-DDTHH:mm:ss.sss+07:00
    
    const m = (month + 1).toString().padStart(2, '0');
    const d = day.toString().padStart(2, '0');
    
    if (type === 'start') {
      return new Date(`${year}-${m}-${d}T00:00:00.000+07:00`);
    } else {
      return new Date(`${year}-${m}-${d}T23:59:59.999+07:00`);
    }
  }

  async getSummary(from?: Date, to?: Date) {
    const orderStats = await this.dichVuDonHang.getStatistics(from, to);
    const purchaseStats = await this.dichVuNhapHang.getStatistics(from, to);

    const revenue = orderStats.totalRevenue || 0;
    const orderCost = orderStats.totalCost ?? 0;
    const purchaseCost = purchaseStats.totalCost || 0;

    // Ưu tiên chi phí dựa trên sản phẩm đã bán (COGS); fallback về tổng nhập hàng
    // LƯU Ý: Nếu orderCost = 0 (do dữ liệu cũ lỗi), lợi nhuận sẽ bị tính sai nếu dùng purchaseCost
    // Logic tốt nhất: Profit = Revenue - COGS (orderCost)
    const cost = orderCost; 
    
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
    const targetYear = year || new Date().getFullYear(); // Cẩn thận: dòng này lấy năm theo giờ Server
    // Lấy năm hiện tại theo giờ VN
    const currentYearVN = year || new Date(new Date().getTime() + 7 * 3600000).getFullYear();

    const monthlyData = [];

    for (let month = 0; month < 12; month++) {
      // SỬA LỖI TẠI ĐÂY: Tạo ngày theo múi giờ +7
      
      // Ngày đầu tháng: 01/MM/YYYY 00:00:00+07:00
      const from = this.createVNDate(currentYearVN, month, 1, 'start');
      
      // Ngày cuối tháng: Lấy ngày 0 của tháng sau để biết tháng này có bao nhiêu ngày
      const daysInMonth = new Date(currentYearVN, month + 1, 0).getDate();
      const to = this.createVNDate(currentYearVN, month, daysInMonth, 'end');

      const summary = await this.getSummary(from, to);

      // Tên tháng tiếng Việt cho thân thiện
      const monthName = `Tháng ${month + 1}`;

      monthlyData.push({
        month: month + 1,
        monthName: monthName,
        ...summary,
      });
    }

    return {
      year: currentYearVN,
      data: monthlyData,
    };
  }
}