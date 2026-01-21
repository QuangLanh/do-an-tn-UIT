/**
 * Report API
 * Cập nhật: Gọi trực tiếp Backend để lấy số liệu chính xác
 */

// Import apiService từ file index
import { apiService } from './index';

export const reportApi = {
  // 1. Lấy báo cáo doanh thu theo ngày
  getDailySalesReport: async (days: number = 30) => {
    try {
      // Dùng (apiService as any) để tránh lỗi 'protected'
      const response = await (apiService as any).get(`/reports/daily-sales?days=${days}`);
      // Kiểm tra cấu trúc trả về (có thể là response hoặc response.data)
      return response; 
    } catch (error) {
      console.error("Lỗi lấy báo cáo ngày:", error);
      return [];
    }
  },

  // 2. Lấy Top sản phẩm bán chạy
  getTopProductsReport: async (limit: number = 10) => {
    try {
      const response = await (apiService as any).get(`/reports/top-products?limit=${limit}`);
      return response;
    } catch (error) {
      console.error("Lỗi lấy top sản phẩm:", error);
      return [];
    }
  },

  // 3. Lấy số liệu tổng quan
  getRevenueSummary: async (from?: string, to?: string) => {
    try {
      const response = await (apiService as any).get(`/reports/summary?from=${from || ''}&to=${to || ''}`);
      return response;
    } catch (error) {
      console.error("Lỗi lấy tổng quan:", error);
      return null;
    }
  },

  // --- Các hàm tiện ích giữ nguyên ---
  calculateProfitMargin: (revenue: number, profit: number) => {
    if (!revenue || revenue === 0) return 0;
    return (profit / revenue) * 100;
  },

  formatCurrency: (value: number) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(value);
  },

  formatNumber: (value: number) => {
    return new Intl.NumberFormat('vi-VN').format(value);
  }
};