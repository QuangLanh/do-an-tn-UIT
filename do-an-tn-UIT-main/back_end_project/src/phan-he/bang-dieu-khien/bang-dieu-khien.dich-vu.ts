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

  /**
   * HÀM QUAN TRỌNG NHẤT: Lấy chuỗi ngày YYYY-MM-DD theo đúng giờ Việt Nam
   * Bất chấp server đang ở Mỹ hay giờ UTC, nó sẽ luôn trả về ngày VN.
   */
  private getCurrentVNDate(): Date {
    const now = new Date();
    // Chuyển đổi thời gian hiện tại sang múi giờ VN
    const vnTimeStr = now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' });
    return new Date(vnTimeStr);
  }

  /**
   * Tạo Date Object từ chuỗi YYYY-MM-DD
   */
  private parseVNDate(dateStr: string): Date {
    return new Date(dateStr);
  }

  /**
   * Format Date thành chuỗi YYYY-MM-DD theo giờ VN
   */
  private formatVNDate(date: Date): string {
    // Dùng sv-SE để có định dạng YYYY-MM-DD chuẩn ISO
    return date.toLocaleDateString('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' });
  }

  async getSummary() {
    // 1. Xử lý dữ liệu HÔM NAY (Today)
    const nowVN = this.getCurrentVNDate();
    const todayStr = this.formatVNDate(nowVN); // Luôn ra ngày 13/01 (nếu là hôm nay)
    
    // Tạo Range Query cho đúng ngày hôm nay (00:00:00 -> 23:59:59 VN)
    const startToday = new Date(`${todayStr}T00:00:00.000+07:00`);
    const endToday = new Date(`${todayStr}T23:59:59.999+07:00`);

    const todaySummary = await this.dichVuGiaoDich.getSummary(startToday, endToday);

    // 2. Xử lý dữ liệu THÁNG NAY (This Month)
    const currentYear = nowVN.getFullYear();
    const currentMonth = nowVN.getMonth(); // 0-11

    // Đầu tháng (VN)
    const startMonthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`;
    const startMonth = new Date(`${startMonthStr}T00:00:00.000+07:00`);

    // Cuối tháng (Lấy ngày đầu của tháng sau trừ đi 1ms)
    // Lưu ý: new Date(year, month + 1, 0) trả về ngày cuối tháng
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const endMonthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${daysInMonth}`;
    const endMonth = new Date(`${endMonthStr}T23:59:59.999+07:00`);

    const monthSummary = await this.dichVuGiaoDich.getSummary(startMonth, endMonth);

    // 3. Sản phẩm sắp hết
    const lowStockProducts = await this.dichVuSanPham.getLowStockProducts();

    // 4. Thống kê ghi nợ
    const debtStatistics = await this.dichVuDonHang.getDebtStatistics();
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
      debt: {
        totalDebtOrders: debtStatistics.totalDebtOrders,
        totalDebtAmount: debtStatistics.totalDebtAmount,
      },
      alerts: {
        lowStockCount: lowStockProducts.length,
        lowStockProducts: lowStockProducts.slice(0, 5).map((p) => ({
          id: p._id?.toString() || p['id']?.toString(),
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

  async getOrdersTrend(days: number = 7) {
    const trend = [];
    // Lấy mốc thời gian hiện tại theo giờ VN
    const nowVN = this.getCurrentVNDate();

    // Vòng lặp lùi từ hôm nay về quá khứ
    for (let i = days - 1; i >= 0; i--) {
      // Clone ngày hiện tại để trừ đi i ngày
      const date = new Date(nowVN);
      date.setDate(date.getDate() - i);
      
      // Bước Quan Trọng: Lấy chuỗi YYYY-MM-DD chuẩn VN
      const dateStr = this.formatVNDate(date);
      console.log(`Ngày tính toán: ${dateStr}`);

      // Tạo range query: Bắt buộc có đuôi +07:00
      const start = new Date(`${dateStr}T00:00:00.000+07:00`);
      const end = new Date(`${dateStr}T23:59:59.999+07:00`);

      const summary = await this.dichVuGiaoDich.getSummary(start, end);

      trend.push({
        date: dateStr, // Trả về ngày hiển thị trên biểu đồ (sẽ là 13/01)
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
    return { recentOrders: recentOrders.slice(0, 5) };
  }
}