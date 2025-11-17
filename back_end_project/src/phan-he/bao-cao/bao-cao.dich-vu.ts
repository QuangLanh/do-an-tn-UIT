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

  async getRevenueReport(from?: Date, to?: Date) {
    const summary = await this.dichVuGiaoDich.getSummary(from, to);
    const topProducts = await this.dichVuDonHang.getTopProducts(10);

    return {
      summary,
      topProducts,
      generatedAt: new Date().toISOString(),
    };
  }

  async exportRevenuePDF(res: Response, from?: Date, to?: Date) {
    const report = await this.getRevenueReport(from, to);

    const doc = new PDFDocument({ margin: 50 });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=revenue-report-${Date.now()}.pdf`,
    );

    doc.pipe(res);

    // Title
    doc.fontSize(20).text('Revenue Report', { align: 'center' });
    doc.moveDown();

    // Period
    if (from || to) {
      doc.fontSize(12).text(
        `Period: ${from?.toLocaleDateString() || 'Start'} - ${to?.toLocaleDateString() || 'Now'}`,
        { align: 'center' },
      );
      doc.moveDown();
    }

    // Summary
    doc.fontSize(16).text('Summary', { underline: true });
    doc.fontSize(12);
    doc.text(`Total Revenue: $${report.summary.revenue.toFixed(2)}`);
    doc.text(`Total Cost: $${report.summary.cost.toFixed(2)}`);
    doc.text(`Profit: $${report.summary.profit.toFixed(2)}`);
    doc.text(`Profit Margin: ${report.summary.profitMargin}%`);
    doc.text(`Total Orders: ${report.summary.totalOrders}`);
    doc.text(`Total Purchases: ${report.summary.totalPurchases}`);
    doc.moveDown();

    // Top Products
    doc.fontSize(16).text('Top Selling Products', { underline: true });
    doc.fontSize(12);

    report.topProducts.forEach((product, index) => {
      doc.text(
        `${index + 1}. ${product.productName} - Qty: ${product.totalQuantity}, Revenue: $${product.totalRevenue.toFixed(2)}`,
      );
    });

    // Footer
    doc.moveDown();
    doc.fontSize(10).text(
      `Generated on: ${new Date().toLocaleString()}`,
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
      (sum, product) => sum + product.stock * product.purchasePrice,
      0,
    );
    const potentialRevenue = products.reduce(
      (sum, product) => sum + product.stock * product.salePrice,
      0,
    );

    return {
      totalProducts,
      totalStockValue,
      potentialRevenue,
      lowStockCount: lowStockProducts.length,
      lowStockProducts: lowStockProducts.map(p => ({
        name: p.name,
        currentStock: p.stock,
        minStockLevel: p.minStockLevel,
      })),
      generatedAt: new Date().toISOString(),
    };
  }
}

