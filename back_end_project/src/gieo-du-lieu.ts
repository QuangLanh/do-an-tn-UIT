import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { UngDungPhanHe } from './ung-dung.phan-he';
import { DichVuNguoiDung } from './phan-he/nguoi-dung/nguoi-dung.dich-vu';
import { DichVuSanPham } from './phan-he/san-pham/san-pham.dich-vu';
import { VaiTroNguoiDung } from './dung-chung/liet-ke/vai-tro-nguoi-dung.enum';

async function gieoDuLieu() {
  const logger = new Logger('GieoDuLieuCoSo');
  const app = await NestFactory.createApplicationContext(UngDungPhanHe);

  const dichVuNguoiDung = app.get(DichVuNguoiDung);
  const dichVuSanPham = app.get(DichVuSanPham);

  try {
    logger.log('🌱 Starting database seeding...');

    // Create users
    logger.log('Creating users...');

    const adminUser = await dichVuNguoiDung
      .create({
      email: 'admin@taphoa.com',
      password: 'admin123',
      fullName: 'Quản Trị Viên',
        role: VaiTroNguoiDung.ADMIN,
      phone: '0901234567',
      address: 'Thành phố Hồ Chí Minh',
      })
      .catch(() => null);

    const staffUser = await dichVuNguoiDung
      .create({
      email: 'staff@taphoa.com',
      password: 'staff123',
      fullName: 'Nguyễn Văn A',
        role: VaiTroNguoiDung.STAFF,
      phone: '0902345678',
      address: 'Thành phố Hồ Chí Minh',
      })
      .catch(() => null);

    if (adminUser) logger.log('✅ Admin user created');
    if (staffUser) logger.log('✅ Staff user created');
    // Note: đã loại bỏ MANAGER/ACCOUNTANT theo yêu cầu (chỉ còn ADMIN/STAFF/KHACH_HANG)

    // Create products
    logger.log('Creating products...');

    const products = [
      {
        name: 'Coca Cola 330ml',
        sku: 'COKE-330',
        description: 'Nước ngọt Coca Cola cổ điển',
        category: 'Đồ uống',
        purchasePrice: 8000,
        salePrice: 12000,
        stock: 100,
        minStockLevel: 20,
        unit: 'chai',
        barcode: '8934563123456',
        imageUrl: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&h=400&fit=crop',
      },
      {
        name: 'Pepsi 330ml',
        sku: 'PEPSI-330',
        description: 'Nước ngọt Pepsi',
        category: 'Đồ uống',
        purchasePrice: 7500,
        salePrice: 11000,
        stock: 80,
        minStockLevel: 20,
        unit: 'chai',
        barcode: '8934563123457',
        imageUrl: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=400&h=400&fit=crop',
      },
      {
        name: 'Mì tôm gà',
        sku: 'NOODLE-001',
        description: 'Mì tôm vị gà',
        category: 'Thực phẩm',
        purchasePrice: 3000,
        salePrice: 5000,
        stock: 200,
        minStockLevel: 50,
        unit: 'gói',
        barcode: '8934563123458',
        imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=400&fit=crop',
      },
      {
        name: 'Gạo trắng 5kg',
        sku: 'RICE-5KG',
        description: 'Gạo trắng cao cấp',
        category: 'Thực phẩm',
        purchasePrice: 50000,
        salePrice: 70000,
        stock: 50,
        minStockLevel: 10,
        unit: 'bao',
        barcode: '8934563123459',
        imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop',
      },
      {
        name: 'Dầu ăn 1L',
        sku: 'OIL-1L',
        description: 'Dầu thực vật',
        category: 'Thực phẩm',
        purchasePrice: 35000,
        salePrice: 45000,
        stock: 60,
        minStockLevel: 15,
        unit: 'chai',
        barcode: '8934563123460',
        imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=400&fit=crop',
      },
      {
        name: 'Đường trắng 1kg',
        sku: 'SUGAR-1KG',
        description: 'Đường trắng tinh luyện',
        category: 'Thực phẩm',
        purchasePrice: 15000,
        salePrice: 20000,
        stock: 40,
        minStockLevel: 10,
        unit: 'gói',
        barcode: '8934563123461',
        imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=400&fit=crop',
      },
      {
        name: 'Muối i-ốt 500g',
        sku: 'SALT-500G',
        description: 'Muối i-ốt',
        category: 'Thực phẩm',
        purchasePrice: 5000,
        salePrice: 8000,
        stock: 100,
        minStockLevel: 20,
        unit: 'gói',
        barcode: '8934563123462',
        imageUrl: 'https://images.unsplash.com/photo-1607424064879-70c19c0430e4?w=400&h=400&fit=crop',
      },
      {
        name: 'Bột giặt 3kg',
        sku: 'DETERGENT-3KG',
        description: 'Bột giặt quần áo',
        category: 'Gia dụng',
        purchasePrice: 80000,
        salePrice: 110000,
        stock: 30,
        minStockLevel: 10,
        unit: 'hộp',
        barcode: '8934563123463',
        imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&h=400&fit=crop',
      },
      {
        name: 'Nước rửa chén 500ml',
        sku: 'SOAP-500ML',
        description: 'Nước rửa chén',
        category: 'Gia dụng',
        purchasePrice: 15000,
        salePrice: 22000,
        stock: 70,
        minStockLevel: 15,
        unit: 'chai',
        barcode: '8934563123464',
        imageUrl: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=400&h=400&fit=crop',
      },
      {
        name: 'Giấy vệ sinh 10 cuộn',
        sku: 'PAPER-10R',
        description: 'Giấy vệ sinh mềm',
        category: 'Gia dụng',
        purchasePrice: 40000,
        salePrice: 55000,
        stock: 45,
        minStockLevel: 10,
        unit: 'gói',
        barcode: '8934563123465',
        imageUrl: 'https://images.unsplash.com/photo-1621863007853-62c6ae5e89aa?w=400&h=400&fit=crop',
      },
      {
        name: 'Dầu gội đầu 200ml',
        sku: 'SHAMPOO-200',
        description: 'Dầu gội đầu',
        category: 'Chăm sóc cá nhân',
        purchasePrice: 25000,
        salePrice: 35000,
        stock: 60,
        minStockLevel: 15,
        unit: 'chai',
        barcode: '8934563123466',
        imageUrl: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop',
      },
      {
        name: 'Kem đánh răng 100g',
        sku: 'PASTE-100',
        description: 'Kem đánh răng bạc hà',
        category: 'Chăm sóc cá nhân',
        purchasePrice: 18000,
        salePrice: 25000,
        stock: 80,
        minStockLevel: 20,
        unit: 'tuýp',
        barcode: '8934563123467',
        imageUrl: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=400&h=400&fit=crop',
      },
      {
        name: 'Sữa tươi 1L',
        sku: 'MILK-1L',
        description: 'Sữa tươi',
        category: 'Sữa và sản phẩm từ sữa',
        purchasePrice: 28000,
        salePrice: 38000,
        stock: 40,
        minStockLevel: 10,
        unit: 'hộp',
        barcode: '8934563123468',
        imageUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=400&fit=crop',
      },
      {
        name: 'Sữa chua dâu 4 hộp',
        sku: 'YOGURT-4',
        description: 'Sữa chua vị dâu',
        category: 'Sữa và sản phẩm từ sữa',
        purchasePrice: 22000,
        salePrice: 30000,
        stock: 35,
        minStockLevel: 10,
        unit: 'gói',
        barcode: '8934563123469',
        imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=400&fit=crop',
      },
      {
        name: 'Trứng gà 10 quả',
        sku: 'EGG-10',
        description: 'Trứng gà tươi',
        category: 'Thực phẩm',
        purchasePrice: 30000,
        salePrice: 40000,
        stock: 25,
        minStockLevel: 10,
        unit: 'gói',
        barcode: '8934563123470',
        imageUrl: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&h=400&fit=crop',
      },
    ];

    for (const product of products) {
      try {
        // Tránh tạo trùng khi chạy seed nhiều lần:
        // nếu SKU/Barcode đã tồn tại => DichVuSanPham.create sẽ tự cộng dồn stock thay vì tạo mới.
        await dichVuSanPham.create(product);
        logger.log(`✅ Product upserted: ${product.name}`);
      } catch (error) {
        logger.warn(`⚠️  Product already exists: ${product.name}`);
      }
    }

    logger.log('\n🎉 Hoàn tất gieo dữ liệu thành công!');
    logger.log('\n📝 Thông tin đăng nhập:');
    logger.log('   Admin: admin@taphoa.com / admin123');
    logger.log('   Nhân viên: staff@taphoa.com / staff123');
    logger.log('\n🚀 Khởi động server với: npm run start:dev');
    logger.log('📚 Tài liệu API: http://localhost:4000/api/docs\n');
  } catch (error) {
    logger.error('❌ Error seeding database:', error.message);
  } finally {
    await app.close();
  }
}

gieoDuLieu();

