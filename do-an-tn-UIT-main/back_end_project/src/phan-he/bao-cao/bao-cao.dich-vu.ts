import { Injectable, Logger } from '@nestjs/common';
import { DichVuDonHang } from '../don-hang/don-hang.dich-vu';
import { DichVuSanPham } from '../san-pham/san-pham.dich-vu';
import { TrangThaiDonHang } from '../../dung-chung/liet-ke/trang-thai-don-hang.enum';
import * as PDFDocument from 'pdfkit';
import { Response } from 'express';

@Injectable()
export class DichVuBaoCao {
  private readonly logger = new Logger(DichVuBaoCao.name);

  constructor(
    private dichVuDonHang: DichVuDonHang,
    private dichVuSanPham: DichVuSanPham,
  ) {}

  // Helper lấy giá vốn
  private async getProductCostMap(): Promise<Map<string, number>> {
    const map = new Map<string, number>();
    try {
        const products = await this.dichVuSanPham.findAll();
        products.forEach((product: any) => {
            const p = product as any;
            const idStr = (p._id || p.id).toString();
            // Lấy giá vốn từ mọi nguồn có thể
            const cost = Number(p.importPrice || p.purchasePrice || 0);
            map.set(idStr, cost);
        });
    } catch (e) {
        this.logger.error('Lỗi lấy giá vốn sản phẩm', e);
    }
    return map;
  }

  // Hàm tính toán chỉ số (Dùng any để tránh lỗi unitPrice)
  private async calculateOrderMetrics(order: any, productCostMap: Map<string, number>) {
    let revenue = 0;
    let cost = 0;

    // Ép kiểu order sang any để truy cập status, paymentStatus thoải mái
    const o = order as any;

    if (o.status !== TrangThaiDonHang.COMPLETED) return { revenue: 0, cost: 0, profit: 0 };
    if (o.paymentStatus !== 'PAID' && o.paymentStatus !== 'REFUNDED') return { revenue: 0, cost: 0, profit: 0 };

    revenue = o.total || 0;

    if (o.items && Array.isArray(o.items)) {
      for (const item of o.items) {
        const i = item as any; // <--- ÉP KIỂU ĐỂ TRÁNH LỖI ĐỎ unitPrice

        // 1. Lấy giá bán
        const salePrice = i.price || i.unitPrice || i.product?.salePrice || 0;

        // 2. Lấy ID và Giá vốn
        let pId = "";
        if (i.product) {
            pId = i.product._id ? i.product._id.toString() : i.product.toString();
        }

        let itemCost = 0;
        if (i.importPrice && i.importPrice > 0) itemCost = i.importPrice;
        else if (i.purchasePrice && i.purchasePrice > 0) itemCost = i.purchasePrice;
        else itemCost = productCostMap.get(pId) || 0;

        // 3. Fallback: Nếu giá vốn vẫn = 0, tự lấy 75% giá bán
        if (itemCost === 0 && salePrice > 0) {
            itemCost = salePrice * 0.75;
        }

        const qty = i.quantity || 0;

        if (o.orderType === 'RETURN') {
          if (o.isRestocked) cost -= itemCost * qty;
        } else {
          cost += itemCost * qty;
        }
      }
    }

    return { revenue, cost, profit: revenue - cost };
  }

  // --- CÁC API BÁO CÁO ---

  async getRevenueReport(from?: Date, to?: Date) {
    if (!from || !to) {
        const now = new Date();
        from = new Date(now.getFullYear(), now.getMonth(), 1);
        to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    }
    const orders = await this.dichVuDonHang.findAll({ from, to, status: TrangThaiDonHang.COMPLETED });
    const costMap = await this.getProductCostMap();

    let totalRevenue = 0, totalCost = 0, totalProfit = 0, totalOrders = 0, totalReturns = 0;

    for (const order of orders) {
       const o = order as any; // Ép kiểu
       const metrics = await this.calculateOrderMetrics(o, costMap);
       totalRevenue += metrics.revenue;
       totalCost += metrics.cost;
       totalProfit += metrics.profit;
       if (o.orderType === 'RETURN') totalReturns++;
       else if (metrics.revenue !== 0) totalOrders++;
    }

    return {
      summary: {
        revenue: totalRevenue, cost: totalCost, profit: totalProfit,
        profitMargin: totalRevenue !== 0 ? Number(((totalProfit / totalRevenue) * 100).toFixed(1)) : 0,
        totalOrders, totalReturns
      },
      topProducts: [], generatedAt: new Date().toISOString(),
    };
  }

  async getDailySalesReport(days: number = 30) {
    const dailyMap = new Map<string, any>();
    for (let i = 0; i < days; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split('T')[0];
        dailyMap.set(key, { date: key, revenue: 0, cost: 0, profit: 0, orders: 0 });
    }

    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - days);
    const orders = await this.dichVuDonHang.findAll({ from, to, status: TrangThaiDonHang.COMPLETED });
    const costMap = await this.getProductCostMap();

    for (const order of orders) {
        // <--- SỬA LỖI ĐỎ createdAt TẠI ĐÂY
        const o = order as any;
        const createdAt = o.createdAt || new Date();
        const dateKey = new Date(createdAt).toISOString().split('T')[0];

        if (!dailyMap.has(dateKey)) continue;

        const metrics = await this.calculateOrderMetrics(o, costMap);
        const dayStat = dailyMap.get(dateKey);

        dayStat.revenue += metrics.revenue;
        dayStat.cost += metrics.cost;
        dayStat.profit += metrics.profit;
        if (o.orderType !== 'RETURN') dayStat.orders += 1;
    }

    return Array.from(dailyMap.values()).sort((a: any, b: any) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }

  async getTopProductsReport(limit: number = 10) {
     const orders = await this.dichVuDonHang.findAll({ status: TrangThaiDonHang.COMPLETED });
     const costMap = await this.getProductCostMap();
     const productMap = new Map<string, any>();

     for (const order of orders) {
        const o = order as any; // Ép kiểu
        if (o.paymentStatus !== 'PAID' && o.paymentStatus !== 'REFUNDED') continue;

        if (o.items) {
            for (const item of o.items) {
                const i = item as any; // <--- ÉP KIỂU
                const pId = i.product && (i.product._id || i.product).toString();
                if(!pId) continue;

                const pName = i.productName || (i.product as any).name || 'Unknown';
                if (!productMap.has(pId)) {
                    productMap.set(pId, { productName: pName, quantitySold: 0, revenue: 0, cost: 0, profit: 0 });
                }

                const entry = productMap.get(pId);
                let itemCost = 0;
                if (i.importPrice && i.importPrice > 0) itemCost = i.importPrice;
                else if (i.purchasePrice && i.purchasePrice > 0) itemCost = i.purchasePrice;
                else itemCost = costMap.get(pId) || 0;

                const salePrice = i.price || i.unitPrice || 0;
                if (itemCost === 0 && salePrice > 0) itemCost = salePrice * 0.75;

                const qty = i.quantity || 0;
                if (o.orderType === 'RETURN') {
                    entry.quantitySold -= qty;
                    entry.revenue -= qty * salePrice;
                    if (o.isRestocked) entry.cost -= qty * itemCost;
                } else {
                    entry.quantitySold += qty;
                    entry.revenue += qty * salePrice;
                    entry.cost += qty * itemCost;
                }
                entry.profit = entry.revenue - entry.cost;
            }
        }
     }
     return Array.from(productMap.values())
        .sort((a: any, b: any) => b.quantitySold - a.quantitySold)
        .slice(0, limit);
  }

  // --- PDF Export và Inventory giữ nguyên ---
  async exportRevenuePDF(res: Response, from?: Date, to?: Date) {
    if (from) from = new Date(from);
    if (to) to = new Date(to);
    const report = await this.getRevenueReport(from, to);
    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=revenue-report-${Date.now()}.pdf`);
    doc.pipe(res);
    doc.fontSize(20).text('Revenue Report', { align: 'center' });
    doc.moveDown();
    const formatCurrency = (amount: number) =>
      new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    doc.fontSize(12).text(`Total Revenue: ${formatCurrency(report.summary.revenue)}`);
    doc.text(`Total Cost: ${formatCurrency(report.summary.cost)}`);
    doc.text(`Profit: ${formatCurrency(report.summary.profit)}`);
    doc.end();
  }

  async getInventoryReport() {
    const products = await this.dichVuSanPham.findAll();
    const lowStockProducts = await this.dichVuSanPham.getLowStockProducts();
    const totalProducts = products.length;
    const totalStockValue = products.reduce((sum, p: any) => {
        const cost = Number(p.importPrice || p.purchasePrice || 0);
        return sum + p.stock * cost;
    }, 0);
    const potentialRevenue = products.reduce((sum, p) => sum + p.stock * (p['price'] || p.salePrice || 0), 0);

    return {
      totalProducts, totalStockValue, potentialRevenue,
      lowStockCount: lowStockProducts.length,
      lowStockProducts: lowStockProducts.map((p) => ({
        name: p.name, currentStock: p.stock, minStockLevel: p.minStockLevel,
      })),
      generatedAt: new Date().toISOString(),
    };
  }
}