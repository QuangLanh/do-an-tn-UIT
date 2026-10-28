import { Logger } from '@nestjs/common';
import { EJSON } from 'bson';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import mongoose from 'mongoose';

/**
 * Xuất toàn bộ dữ liệu ra các file JSON để bàn giao dự án.
 *
 *   npm run export:json                 # ra thư mục du-lieu-mau/
 *   npm run export:json -- thu-muc-khac
 *
 * Mỗi collection thành một file `<ten-collection>.json` ở dạng Extended JSON,
 * nên ObjectId thành {"$oid": …} và Date thành {"$date": …}. Đây là dạng mà
 * MongoDB Compass (Add Data → Import JSON) và `npm run import:json` đọc đúng
 * kiểu dữ liệu. Nếu dùng JSON.stringify thường thì ObjectId biến thành chuỗi
 * và mọi liên kết giữa đơn hàng ↔ sản phẩm ↔ cửa hàng sẽ đứt.
 *
 * Script chạy trực tiếp trên driver nên không đi qua plugin đa cửa hàng —
 * có chủ đích, vì bàn giao thì cần dữ liệu của mọi cửa hàng.
 */

/** Collection vòng đời ngắn, không có giá trị khi bàn giao. */
const BO_QUA = new Set(['otps']);

async function xuatDuLieu() {
  const logger = new Logger('XuatDuLieuJson');
  dotenv.config();

  const uri = process.env.MONGO_URI;
  if (!uri) {
    logger.error('Thiếu MONGO_URI trong .env');
    process.exit(1);
  }

  const thuMuc = path.resolve(process.cwd(), process.argv[2] || 'du-lieu-mau');
  fs.mkdirSync(thuMuc, { recursive: true });

  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  logger.log(`Đã kết nối database: ${db.databaseName}`);

  try {
    const danhSach = await db.listCollections().toArray();
    let tongBanGhi = 0;

    for (const { name } of danhSach.sort((a, b) => a.name.localeCompare(b.name))) {
      if (BO_QUA.has(name)) {
        logger.log(`⏭️  Bỏ qua ${name}`);
        continue;
      }

      const banGhi = await db.collection(name).find({}).toArray();
      const duongDan = path.join(thuMuc, `${name}.json`);
      // relaxed: true cho ra file dễ đọc, vẫn giữ nguyên $oid và $date.
      fs.writeFileSync(
        duongDan,
        EJSON.stringify(banGhi, undefined, 2, { relaxed: true }),
        'utf8',
      );

      tongBanGhi += banGhi.length;
      logger.log(`📤 ${name}: ${banGhi.length} bản ghi → ${path.basename(duongDan)}`);
    }

    logger.log('──────────────────────────────────────────');
    logger.log(`Xong. ${tongBanGhi} bản ghi trong ${thuMuc}`);
    logger.warn(
      'File users.json chứa mật khẩu đã băm bcrypt, customers.json chứa số điện thoại thật. ' +
        'Đừng đẩy lên repo công khai — gửi riêng thư mục này hoặc dùng repo private.',
    );
  } finally {
    await mongoose.disconnect();
  }
}

xuatDuLieu()
  .then(() => process.exit(0))
  .catch((loi) => {
    new Logger('XuatDuLieuJson').error((loi as Error).message);
    process.exit(1);
  });
