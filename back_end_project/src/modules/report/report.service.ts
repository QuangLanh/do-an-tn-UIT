import { Injectable, Logger } from '@nestjs/common';
import { TransactionService } from '../transaction/transaction.service';
import { OrderService } from '../order/order.service';
import { PurchaseService } from '../purchase/purchase.service';
import { ProductService } from '../product/product.service';
import * as PDFDocument from 'pdfkit';
import { Response } from 'express';

@Injectable()
export class ReportService {
  private readonly logger = new Logger(ReportService.name);

  constructor(
    private transactionService: TransactionService,
    private orderService: OrderService,
    private purchaseService: PurchaseService,
    private productService: ProductService,
  ) {}

  async getRevenueReport(from?: Date, to?: Date) {
    const summary = await this.transactionService.getSummary(from, to);
    const topProducts = await this.orderService.getTopProducts(10);

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
    const products = await this.productService.findAll();
    const lowStockProducts = await this.productService.getLowStockProducts();

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

