import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { UngDungPhanHe } from './ung-dung.phan-he';
import { DichVuSanPham } from './phan-he/san-pham/san-pham.dich-vu';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';

function taoSKU(ten: string): string {
  return ten
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/Đ/g, "D")
    .replace(/[^A-Z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function gieoDuLieu() {
  const logger = new Logger('GieoDuLieuTapHoa');
  const app = await NestFactory.createApplicationContext(UngDungPhanHe);
  const dichVuSanPham = app.get(DichVuSanPham);
  const connection = app.get<Connection>(getConnectionToken());

  try {
    console.log('\n==================================================');
    logger.log(`🔌 ĐANG KẾT NỐI DATABASE: [ ${connection.name.toUpperCase()} ]`);
    console.log('==================================================\n');

    // Kiểm tra tên DB. Nếu là 'test' thì có thể đang sai cấu hình
    if (connection.name === 'test') {
        logger.warn('⚠️ CẢNH BÁO: Bạn đang kết nối vào DB "test". Dữ liệu thật có thể nằm ở DB "taphoa"!');
    }

    logger.log('🔥 BẮT ĐẦU QUY TRÌNH RESET DỮ LIỆU...');

    // Lấy danh sách tất cả các bảng hiện có
    const collections = await connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    logger.log(`📂 Các bảng hiện có trong DB: ${collectionNames.join(', ')}`);

    // --- XÓA SẠCH SẼ ---
    // Danh sách các tên bảng có thể chứa sản phẩm (thử hết các trường hợp)
    const targetCollections = ['products', 'sanphams', 'product', 'sanpham'];

    for (const name of targetCollections) {
        if (collectionNames.includes(name)) {
            logger.log(`🗑️  Đang xóa bảng: "${name}"...`);
            try {
                // Drop collection là xóa sạch cả bảng, nhanh và sạch hơn deleteMany
                await connection.db.dropCollection(name);
                logger.log(`✅ Đã xóa thành công bảng "${name}"`);
            } catch (e) {
                logger.error(`❌ Lỗi khi xóa bảng ${name}: ${e.message}`);
            }
        }
    }

    // --- NẠP DỮ LIỆU MỚI ---
    logger.log('\n🌱 Đang đọc file du-lieu-san-pham.json...');
    const tenFileDuLieu = 'du-lieu-san-pham.json';
    const duongDanFile = path.join(process.cwd(), tenFileDuLieu);

    if (!fs.existsSync(duongDanFile)) {
      throw new Error(`Không tìm thấy file ${tenFileDuLieu}!`);
    }

    const duLieuTho = fs.readFileSync(duongDanFile, 'utf8');
    const danhSachSanPham = JSON.parse(duLieuTho);

    logger.log(`📦 Tìm thấy ${danhSachSanPham.length} sản phẩm. Đang nạp...`);

    let thanhCong = 0;
    for (const sp of danhSachSanPham) {
      try {
        const sanPhamMoi = {
          name: sp.name,
          sku: taoSKU(sp.name) + '-' + Math.floor(Math.random() * 100000),
          description: `Sản phẩm ${sp.name}`,
          category: sp.category,
          purchasePrice: Math.round(sp.price * 0.7),
          salePrice: sp.price,
          stock: 50,
          minStockLevel: 5,
          unit: sp.unit,
          imageUrl: sp.imageUrl,
        };

        await dichVuSanPham.create(sanPhamMoi);
        thanhCong++;
        process.stdout.write('.');
      } catch (error) {
        // Bỏ qua lỗi trùng
      }
    }

    console.log('\n');
    logger.log(`🎉 HOÀN TẤT! Đã nạp ${thanhCong} sản phẩm vào Database "${connection.name}".`);

  } catch (error) {
    logger.error('❌ Lỗi chương trình:', error.message);
  } finally {
    await app.close();
  }
}

gieoDuLieu();