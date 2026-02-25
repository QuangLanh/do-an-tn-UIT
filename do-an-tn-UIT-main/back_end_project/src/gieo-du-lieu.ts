import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { UngDungPhanHe } from './ung-dung.phan-he';
import { DichVuSanPham } from './phan-he/san-pham/san-pham.dich-vu';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';

// Hàm tạo SKU an toàn (Chống lỗi undefined)
function taoSKU(ten: string): string {
  if (!ten) return 'SKU-UNKNOWN-' + Math.floor(Math.random() * 10000);
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

    // --- BƯỚC 1: XÓA DỮ LIỆU CŨ ---
    const collections = await connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    const targetCollections = ['products', 'sanphams', 'product', 'sanpham'];

    for (const name of targetCollections) {
        if (collectionNames.includes(name)) {
            logger.log(`🗑️  Đang xóa bảng cũ: "${name}"...`);
            await connection.db.dropCollection(name);
        }
    }

    // --- BƯỚC 2: ĐỌC FILE JSON ---
    const tenFileDuLieu = 'du-lieu-san-pham.json'; 
    const duongDanFile = path.join(process.cwd(), tenFileDuLieu);

    if (!fs.existsSync(duongDanFile)) {
      throw new Error(`❌ KHÔNG TÌM THẤY FILE: ${tenFileDuLieu} tại ${duongDanFile}`);
    }

    const duLieuTho = fs.readFileSync(duongDanFile, 'utf8');
    
    let danhSachSanPham;
    try {
        danhSachSanPham = JSON.parse(duLieuTho);
    } catch (e) {
        throw new Error("❌ File JSON bị lỗi cú pháp! Hãy kiểm tra lại file du-lieu-san-pham.json");
    }

    // Kiểm tra xem dữ liệu có phải là mảng không
    if (!Array.isArray(danhSachSanPham)) {
        throw new Error("❌ Dữ liệu trong file JSON không phải là một danh sách (Array)!");
    }

    logger.log(`📦 Tìm thấy ${danhSachSanPham.length} mục trong file. Đang kiểm tra và nạp...`);

    // --- BƯỚC 3: NẠP DỮ LIỆU ---
    let thanhCong = 0;
    let thatBai = 0;

    // Duyệt vòng lặp
    for (let i = 0; i < danhSachSanPham.length; i++) {
      const sp = danhSachSanPham[i];
      
      // KIỂM TRA DỮ LIỆU ĐẦU VÀO (QUAN TRỌNG)
      if (!sp || typeof sp !== 'object') {
          console.log(`\n⚠️ Bỏ qua mục số ${i + 1}: Dữ liệu không hợp lệ (null hoặc không phải object).`);
          thatBai++;
          continue;
      }
      
      // Nếu thiếu tên, gán tên mặc định để không lỗi code
      const tenSanPham = sp.name || `Sản phẩm không tên ${i + 1}`;

      try {
        const sanPhamMoi = {
          name: tenSanPham,
          sku: taoSKU(tenSanPham) + '-' + Math.floor(Math.random() * 10000),
          
          description: sp.description || `<div>Sản phẩm ${tenSanPham}</div>`,
          brand: sp.brand || undefined,
          origin: sp.origin || undefined,
          category: sp.category || 'Chưa phân loại',
          tags: Array.isArray(sp.tags) ? sp.tags : [],
          
          purchasePrice: sp.importPrice || (sp.price ? Math.round(sp.price * 0.7) : 0),
          salePrice: sp.price || 0,
          
          stock: 100,
          minStockLevel: 5,
          unit: sp.unit || 'cái',
          
          imageUrl: sp.imageUrl || '', 
          // images & status được giữ lại trong file JSON để frontend có thể dùng,
          // nhưng schema backend hiện chỉ lưu imageUrl/isActive
          // isActive luôn true cho dữ liệu seed
          isActive: true,
        };

        await dichVuSanPham.create(sanPhamMoi);
        thanhCong++;
        process.stdout.write('✅'); 
        
      } catch (error) {
        thatBai++;
        process.stdout.write('❌');
        console.log(`\n⚠️ LỖI NẠP [${tenSanPham}]: ${error.message}`);
      }
    }

    console.log('\n\n==================================================');
    logger.log(`🎉 KẾT QUẢ: Thành công ${thanhCong} | Thất bại ${thatBai}`);
    console.log('==================================================\n');

  } catch (error) {
    logger.error('❌ LỖI CHƯƠNG TRÌNH:', error.message);
  } finally {
    await app.close();
  }
}

gieoDuLieu();