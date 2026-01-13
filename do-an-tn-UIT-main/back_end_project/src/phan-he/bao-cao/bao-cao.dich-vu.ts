import { Injectable, Logger } from '@nestjs/common';
import { DichVuGiaoDich } from '../giao-dich/giao-dich.dich-vu';
import { DichVuDonHang } from '../don-hang/don-hang.dich-vu';
import { DichVuNhapHang } from '../nhap-hang/nhap-hang.dich-vu';
import { DichVuSanPham } from '../san-pham/san-pham.dich-vu';
import * as PDFDocument from 'pdfkit';
import { Response } from 'express';

@Injectable()
export class DichVuBaoCao {
  private readonly logger = new Logger(DichVuBaoCao.name);

  constructor(
    private dichVuGiaoDich: DichVuGiaoDich,
    private dichVuDonHang: DichVuDonHang,
    private dichVuNhapHang: DichVuNhapHang,
    private dichVuSanPham: DichVuSanPham,
  ) {}

  // Helper chuyển đổi ngày hiển thị VN
  private formatDateVN(date: Date): string {
    return date.toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
  }

  // Helper lấy giờ VN hiện tại
  private getVNTimeStr(): string {
    return new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
  }

  async getRevenueReport(from?: Date, to?: Date) {
    // Nếu không truyền ngày, mặc định lấy tháng này theo giờ VN
    if (!from || !to) {
        const now = new Date();
        const y = now.getFullYear();
        const m = now.getMonth();
        // Mặc định đầu tháng đến cuối tháng (UTC) - Logic đơn giản cho default
        from = new Date(y, m, 1);
        to = new Date(y, m + 1, 0, 23, 59, 59);
    }

    const summary = await this.dichVuGiaoDich.getSummary(from, to);
    const topProducts = await this.dichVuDonHang.getTopProducts(10);

    return {
      summary,
      topProducts,
      generatedAt: new Date().toISOString(),
    };
  }

  async exportRevenuePDF(res: Response, from?: Date, to?: Date) {
    // Xử lý ngày nhận vào nếu là chuỗi hoặc undefined
    if (from) from = new Date(from);
    if (to) to = new Date(to);

    const report = await this.getRevenueReport(from, to);

    const doc = new PDFDocument({ margin: 50 });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=revenue-report-${Date.now()}.pdf`,
    );

    doc.pipe(res);

    // --- PHẦN NÀY CẦN FONT HỖ TRỢ TIẾNG VIỆT ---
    // Mặc định PDFKit không hỗ trợ Tiếng Việt có dấu tốt nếu không load font
    // Để an toàn, mình dùng Tiếng Anh hoặc bạn cần load font .ttf vào
    
    // Title
    doc.fontSize(20).text('Revenue Report (Bao Cao Doanh Thu)', { align: 'center' });
    doc.moveDown();

    // Period
    if (from || to) {
      doc.fontSize(12).text(
        `Period: ${from ? this.formatDateVN(from) : 'Start'} - ${to ? this.formatDateVN(to) : 'Now'}`,
        { align: 'center' },
      );
      doc.moveDown();
    }

    // Summary
    doc.fontSize(16).text('Summary', { underline: true });
    doc.fontSize(12);
    // Format tiền tệ VNĐ
    const formatCurrency = (amount: number) => 
      new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    doc.text(`Total Revenue: ${formatCurrency(report.summary.revenue)}`);
    doc.text(`Total Cost: ${formatCurrency(report.summary.cost)}`);
    doc.text(`Profit: ${formatCurrency(report.summary.profit)}`);
    doc.text(`Profit Margin: ${report.summary.profitMargin}%`);
    doc.text(`Total Orders: ${report.summary.totalOrders}`);
    doc.text(`Total Purchases: ${report.summary.totalPurchases}`);
    doc.moveDown();

    // Top Products
    doc.fontSize(16).text('Top Selling Products', { underline: true });
    doc.fontSize(12);

    report.topProducts.forEach((product, index) => {
      // Lưu ý: productName có thể bị lỗi font nếu có dấu tiếng Việt
      // Nếu bị lỗi ô vuông, bạn cần cài đặt custom font cho PDFKit
      doc.text(
        `${index + 1}. ${product.productName} - Qty: ${product.totalQuantity}, Rev: ${formatCurrency(product.totalRevenue)}`,
      );
    });

    // Footer
    doc.moveDown();
    doc.fontSize(10).text(
      `Generated on (VN Time): ${this.getVNTimeStr()}`,
      { align: 'center' },
    );

    doc.end();

    this.logger.log('Revenue report PDF generated');
  }

  async getInventoryReport() {
    const products = await this.dichVuSanPham.findAll();
    const lowStockProducts = await this.dichVuSanPham.getLowStockProducts();

    const totalProducts = products.length;
    const totalStockValue = products.reduce(
      (sum, product) => sum + product.stock * (product['importPrice'] || product['purchasePrice'] || 0),
      0,
    );
    const potentialRevenue = products.reduce(
      (sum, product) => sum + product.stock * (product['price'] || product.salePrice || 0),
      0,
    );

    return {
      totalProducts,
      totalStockValue,
      potentialRevenue,
      lowStockCount: lowStockProducts.length,
      lowStockProducts: lowStockProducts.map((p) => ({
        name: p.name,
        currentStock: p.stock,
        minStockLevel: p.minStockLevel,
      })),
      generatedAt: new Date().toISOString(),
    };
  }
}