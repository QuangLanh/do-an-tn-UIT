import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { UngDungPhanHe } from '../ung-dung.phan-he';
import { DichVuCuaHang } from '../phan-he/cua-hang/cua-hang.dich-vu';
import { chayBoQuaLoc } from '../dung-chung/da-cua-hang/ngu-canh-cua-hang';
import { NganhHang } from '../dung-chung/liet-ke/nganh-hang.enum';

/**
 * Chuyển dữ liệu một cửa hàng hiện có sang mô hình nhiều cửa hàng.
 *
 *   npm run migrate:multi-store                        # dùng cửa hàng mặc định
 *   npm run migrate:multi-store -- cua-hang-cua-toi "Tạp hóa Minh Anh"
 *
 * Việc script làm:
 *  1. Tạo (hoặc lấy) cửa hàng đích
 *  2. Gán storeId cho toàn bộ bản ghi chưa có
 *  3. Xóa các unique index cũ theo một trường (giờ đã thay bằng index ghép với storeId)
 *
 * Chạy lại nhiều lần vẫn an toàn: chỉ đụng vào bản ghi còn thiếu storeId.
 */

/** Các collection có dữ liệu thuộc về cửa hàng, kèm index cũ cần xóa. */
const CAC_COLLECTION: Array<{ ten: string; indexCanXoa?: string[] }> = [
  { ten: 'products', indexCanXoa: ['sku_1', 'barcode_1'] },
  { ten: 'orders', indexCanXoa: ['orderNumber_1'] },
  { ten: 'purchases', indexCanXoa: ['purchaseNumber_1'] },
  { ten: 'stockbatches' },
  { ten: 'customers', indexCanXoa: ['soDienThoai_1'] },
  { ten: 'users' },
  { ten: 'nha-cung-cap', indexCanXoa: ['code_1'] },
  { ten: 'lichsuthaotacs' },
  { ten: 'shoppinglists' },
  { ten: 'otps' },
];

async function chuyenDoi() {
  const logger = new Logger('ChuyenDoiDaCuaHang');
  const app = await NestFactory.createApplicationContext(UngDungPhanHe, {
    logger: ['error', 'warn', 'log'],
  });

  const connection = app.get<Connection>(getConnectionToken());
  const dichVuCuaHang = app.get(DichVuCuaHang);

  const maCuaHang = (process.argv[2] || 'cua-hang-mac-dinh').trim().toLowerCase();
  const tenCuaHang = process.argv[3] || 'Cửa hàng mặc định';

  try {
    logger.log(`Cơ sở dữ liệu: ${connection.name}`);

    // --- 1. Cửa hàng đích ---
    let cuaHang = await dichVuCuaHang.timTheoMa(maCuaHang);
    if (!cuaHang) {
      cuaHang = (await dichVuCuaHang.tao({
        ma: maCuaHang,
        ten: tenCuaHang,
        nganhHang: NganhHang.TAP_HOA,
      })) as any;
      logger.log(`Đã tạo cửa hàng "${maCuaHang}" (${tenCuaHang})`);
    } else {
      logger.log(`Dùng cửa hàng có sẵn "${maCuaHang}"`);
    }

    const storeId = (cuaHang as any)._id;

    // --- 2. Gán storeId cho dữ liệu cũ ---
    const danhSachCollection = (await connection.db.listCollections().toArray()).map(
      (c) => c.name,
    );

    let tongCapNhat = 0;
    for (const { ten } of CAC_COLLECTION) {
      if (!danhSachCollection.includes(ten)) {
        logger.log(`Bỏ qua "${ten}" — chưa tồn tại`);
        continue;
      }

      const ketQua = await connection.db
        .collection(ten)
        .updateMany({ storeId: { $exists: false } }, { $set: { storeId } });

      tongCapNhat += ketQua.modifiedCount;
      logger.log(
        `${ten}: gán storeId cho ${ketQua.modifiedCount} bản ghi ` +
          `(khớp ${ketQua.matchedCount})`,
      );
    }

    // --- 3. Xóa unique index cũ theo một trường ---
    for (const { ten, indexCanXoa } of CAC_COLLECTION) {
      if (!indexCanXoa || !danhSachCollection.includes(ten)) continue;

      const indexHienCo = await connection.db.collection(ten).indexes();
      for (const tenIndex of indexCanXoa) {
        if (!indexHienCo.some((i) => i.name === tenIndex)) continue;
        try {
          await connection.db.collection(ten).dropIndex(tenIndex);
          logger.log(`${ten}: đã xóa index cũ "${tenIndex}"`);
        } catch (error) {
          logger.warn(
            `${ten}: không xóa được index "${tenIndex}" — ${(error as Error).message}`,
          );
        }
      }
    }

    // --- 4. Kiểm tra còn sót ---
    let conSot = 0;
    for (const { ten } of CAC_COLLECTION) {
      if (!danhSachCollection.includes(ten)) continue;
      const sot = await connection.db
        .collection(ten)
        .countDocuments({ storeId: { $exists: false } });
      if (sot > 0) {
        conSot += sot;
        logger.error(`${ten}: còn ${sot} bản ghi thiếu storeId`);
      }
    }

    logger.log('──────────────────────────────────────────');
    logger.log(`Đã gán storeId cho ${tongCapNhat} bản ghi.`);
    if (conSot === 0) {
      logger.log('Không còn bản ghi nào thiếu storeId. Chuyển đổi hoàn tất.');
      logger.log(
        `Web khách hàng truy cập cửa hàng này tại: /s/${maCuaHang}`,
      );
    } else {
      logger.error(`Còn ${conSot} bản ghi thiếu storeId — kiểm tra lại trước khi chạy hệ thống.`);
    }
  } catch (error) {
    logger.error(`Chuyển đổi thất bại: ${(error as Error).message}`);
    throw error;
  } finally {
    await app.close();
  }
}

// Toàn bộ script chạy ngoài phạm vi lọc cửa hàng vì nó thao tác trên mọi tenant.
chayBoQuaLoc(chuyenDoi)
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
