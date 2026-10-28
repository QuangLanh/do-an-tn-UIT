import { Logger } from '@nestjs/common';
import { EJSON } from 'bson';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import mongoose from 'mongoose';

/**
 * Nạp các file JSON do `npm run export:json` tạo ra vào database đang trỏ tới
 * trong .env — dùng khi người khác clone dự án về và chạy MongoDB trên máy họ.
 *
 *   npm run import:json                      # đọc du-lieu-mau/
 *   npm run import:json -- thu-muc-khac
 *   npm run import:json -- du-lieu-mau --ghi-de   # xóa dữ liệu cũ trước khi nạp
 *
 * Mặc định script KHÔNG xóa gì: collection nào đã có dữ liệu thì bỏ qua, để
 * chạy lỡ tay không làm mất dữ liệu đang có. Cần nạp lại từ đầu thì thêm --ghi-de.
 *
 * Index không cần nạp — Mongoose tự tạo lại (kể cả các unique index ghép với
 * storeId) ở lần `npm run start:dev` đầu tiên.
 */

async function napDuLieu() {
  const logger = new Logger('NapDuLieuJson');
  dotenv.config();

  const uri = process.env.MONGO_URI;
  if (!uri) {
    logger.error('Thiếu MONGO_URI trong .env');
    process.exit(1);
  }

  const thamSo = process.argv.slice(2);
  const ghiDe = thamSo.includes('--ghi-de');
  const thuMuc = path.resolve(
    process.cwd(),
    thamSo.find((t) => !t.startsWith('--')) || 'du-lieu-mau',
  );

  if (!fs.existsSync(thuMuc)) {
    logger.error(`Không thấy thư mục dữ liệu: ${thuMuc}`);
    process.exit(1);
  }

  const cacFile = fs
    .readdirSync(thuMuc)
    .filter((t) => t.endsWith('.json'))
    .sort();

  if (cacFile.length === 0) {
    logger.error(`Thư mục ${thuMuc} không có file .json nào`);
    process.exit(1);
  }

  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  logger.log(`Đã kết nối database: ${db.databaseName}`);

  try {
    let tongNap = 0;

    for (const tenFile of cacFile) {
      const tenCollection = path.basename(tenFile, '.json');
      const noiDung = fs.readFileSync(path.join(thuMuc, tenFile), 'utf8');
      // EJSON.parse phục hồi ObjectId/Date từ {"$oid"}/{"$date"}.
      const banGhi = EJSON.parse(noiDung, { relaxed: true }) as any[];

      if (!Array.isArray(banGhi) || banGhi.length === 0) {
        logger.log(`⏭️  ${tenCollection}: file rỗng`);
        continue;
      }

      const daCo = await db.collection(tenCollection).countDocuments();
      if (daCo > 0) {
        if (!ghiDe) {
          logger.warn(
            `⏭️  ${tenCollection}: đã có ${daCo} bản ghi, bỏ qua (thêm --ghi-de để nạp lại)`,
          );
          continue;
        }
        await db.collection(tenCollection).deleteMany({});
        logger.log(`🗑️  ${tenCollection}: đã xóa ${daCo} bản ghi cũ`);
      }

      // ordered: false để một bản ghi lỗi không chặn phần còn lại.
      await db.collection(tenCollection).insertMany(banGhi, { ordered: false });
      tongNap += banGhi.length;
      logger.log(`📥 ${tenCollection}: ${banGhi.length} bản ghi`);
    }

    logger.log('──────────────────────────────────────────');
    logger.log(`Xong. Đã nạp ${tongNap} bản ghi.`);

    const cuaHang = await db.collection('stores').find({}).toArray();
    if (cuaHang.length > 0) {
      logger.log('Cửa hàng có trong dữ liệu:');
      for (const ch of cuaHang) {
        logger.log(`  • ${ch.ma} — ${ch.ten}  (web khách: /s/${ch.ma})`);
      }
    } else {
      logger.warn(
        'Chưa có cửa hàng nào. Chạy `npm run seed -- cua-hang-mac-dinh` để tạo cửa hàng và dữ liệu sản phẩm mẫu.',
      );
    }
  } finally {
    await mongoose.disconnect();
  }
}

napDuLieu()
  .then(() => process.exit(0))
  .catch((loi) => {
    new Logger('NapDuLieuJson').error((loi as Error).message);
    process.exit(1);
  });
