import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UngDungPhanHe } from '../ung-dung.phan-he';
import { ProductDocument, Product } from '../phan-he/san-pham/schemas/product.schema';
import { OrderDocument, Order } from '../phan-he/don-hang/schemas/order.schema';
import { PurchaseDocument, Purchase } from '../phan-he/nhap-hang/schemas/purchase.schema';
import {
  DanhSachMuaHang,
  DanhSachMuaHangDocument,
} from '../phan-he/danh-sach-mua-hang/schemas/danh-sach-mua-hang.schema';

/**
 * Script gộp sản phẩm trùng trong DB:
 * - Mặc định chạy DRY-RUN (chỉ log), không xoá dữ liệu.
 * - Để áp dụng thật: chạy `npm run dedupe:products -- --apply`
 *
 * Quy tắc gộp:
 * - Ưu tiên group theo SKU (nếu có), fallback theo tên (name).
 * - Khi gộp: cộng dồn `stock` vào 1 bản "giữ lại".
 * - Cập nhật references:
 *   - orders.items.product
 *   - purchases.items.product
 *   - shopping-lists.items.productId
 * - Sau đó xoá các bản trùng còn lại.
 */

const logger = new Logger('GopSanPhamTrung');

function hasApplyFlag() {
  return process.argv.includes('--apply') || process.env.APPLY === 'true';
}

function normalizeText(value?: string) {
  return (value || '').trim().toLowerCase();
}

function toObjectId(id: string | Types.ObjectId) {
  return typeof id === 'string' ? new Types.ObjectId(id) : id;
}

type LeanProduct = {
  _id: Types.ObjectId;
  name: string;
  sku?: string;
  barcode?: string;
  stock: number;
  createdAt?: Date;
  updatedAt?: Date;
};

async function main() {
  const APPLY = hasApplyFlag();
  logger.log(`Mode: ${APPLY ? 'APPLY (write)' : 'DRY-RUN (no write)'}`);

  const app = await NestFactory.createApplicationContext(UngDungPhanHe, {
    logger: false,
  });

  try {
    const productModel = app.get<Model<ProductDocument>>(getModelToken(Product.name));
    const orderModel = app.get<Model<OrderDocument>>(getModelToken(Order.name));
    const purchaseModel = app.get<Model<PurchaseDocument>>(getModelToken(Purchase.name));
    const shoppingListModel = app.get<Model<DanhSachMuaHangDocument>>(
      getModelToken(DanhSachMuaHang.name),
    );

    const products = (await productModel
      .find({})
      .select({ name: 1, sku: 1, barcode: 1, stock: 1, createdAt: 1, updatedAt: 1 })
      .lean()
      .exec()) as unknown as LeanProduct[];

    // Group key: SKU if available else Name
    const groups = new Map<string, LeanProduct[]>();
    for (const p of products) {
      const key = normalizeText(p.sku) || `name:${normalizeText(p.name)}`;
      const list = groups.get(key) || [];
      list.push(p);
      groups.set(key, list);
    }

    const dupGroups = Array.from(groups.entries()).filter(([, list]) => list.length > 1);
    logger.log(`Found duplicate groups: ${dupGroups.length}`);

    for (const [key, list] of dupGroups) {
      // Pick canonical: oldest createdAt (fallback to smallest _id)
      const sorted = [...list].sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        if (aTime !== bTime) return aTime - bTime;
        return a._id.toString().localeCompare(b._id.toString());
      });

      const keep = sorted[0];
      const dups = sorted.slice(1);

      const totalStock = sorted.reduce((sum, p) => sum + (Number(p.stock) || 0), 0);
      logger.log(
        `\n[${key}] keep=${keep._id.toString()} name="${keep.name}" sku="${keep.sku || ''}" ` +
          `duplicates=${dups.length} totalStock=${totalStock}`,
      );

      if (!APPLY) continue;

      // 1) Update canonical stock
      await productModel.updateOne(
        { _id: keep._id },
        { $set: { stock: totalStock } },
      ).exec();

      // 2) Re-point references then delete duplicate products
      for (const dup of dups) {
        const dupId = toObjectId(dup._id);
        const keepId = toObjectId(keep._id);

        // Orders: items.product
        await orderModel.updateMany(
          { 'items.product': dupId },
          { $set: { 'items.$[elem].product': keepId } },
          { arrayFilters: [{ 'elem.product': dupId }] },
        ).exec();

        // Purchases: items.product
        await purchaseModel.updateMany(
          { 'items.product': dupId },
          { $set: { 'items.$[elem].product': keepId } },
          { arrayFilters: [{ 'elem.product': dupId }] },
        ).exec();

        // Shopping lists: items.productId
        await shoppingListModel.updateMany(
          { 'items.productId': dupId },
          { $set: { 'items.$[elem].productId': keepId } },
          { arrayFilters: [{ 'elem.productId': dupId }] },
        ).exec();

        // Delete duplicate product
        await productModel.deleteOne({ _id: dupId }).exec();
        logger.log(`- merged & deleted duplicate product: ${dupId.toString()}`);
      }
    }

    logger.log(`\nDone. ${APPLY ? 'Changes applied.' : 'Dry-run only; no changes applied.'}`);
  } finally {
    await app.close();
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});



