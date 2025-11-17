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
      fullName: 'System Administrator',
        role: VaiTroNguoiDung.ADMIN,
      phone: '0901234567',
      address: 'Ho Chi Minh City',
      })
      .catch(() => null);

    const staffUser = await dichVuNguoiDung
      .create({
      email: 'staff@taphoa.com',
      password: 'staff123',
      fullName: 'Nguyen Van A',
        role: VaiTroNguoiDung.STAFF,
      phone: '0902345678',
      address: 'Ho Chi Minh City',
      })
      .catch(() => null);

    const managerUser = await dichVuNguoiDung
      .create({
      email: 'manager@taphoa.com',
      password: 'manager123',
      fullName: 'Tran Thi B',
        role: VaiTroNguoiDung.MANAGER,
      phone: '0903456789',
      address: 'Hanoi',
      })
      .catch(() => null);

    const accountantUser = await dichVuNguoiDung
      .create({
      email: 'accountant@taphoa.com',
      password: 'accountant123',
      fullName: 'Le Van C',
        role: VaiTroNguoiDung.ACCOUNTANT,
      phone: '0904567890',
      address: 'Ho Chi Minh City',
      })
      .catch(() => null);

    if (adminUser) logger.log('✅ Admin user created');
    if (staffUser) logger.log('✅ Staff user created');
    if (managerUser) logger.log('✅ Manager user created');
    if (accountantUser) logger.log('✅ Accountant user created');

    // Create products
    logger.log('Creating products...');

    const products = [
      {
        name: 'Coca Cola 330ml',
        sku: 'COKE-330',
        description: 'Classic Coca Cola drink',
        category: 'Beverages',
        purchasePrice: 8000,
        salePrice: 12000,
        stock: 100,
        minStockLevel: 20,
        unit: 'bottle',
        barcode: '8934563123456',
      },
      {
        name: 'Pepsi 330ml',
        sku: 'PEPSI-330',
        description: 'Pepsi soft drink',
        category: 'Beverages',
        purchasePrice: 7500,
        salePrice: 11000,
        stock: 80,
        minStockLevel: 20,
        unit: 'bottle',
        barcode: '8934563123457',
      },
      {
        name: 'Instant Noodles - Chicken',
        sku: 'NOODLE-001',
        description: 'Instant noodles chicken flavor',
        category: 'Food',
        purchasePrice: 3000,
        salePrice: 5000,
        stock: 200,
        minStockLevel: 50,
        unit: 'pack',
        barcode: '8934563123458',
      },
      {
        name: 'White Rice 5kg',
        sku: 'RICE-5KG',
        description: 'Premium white rice',
        category: 'Food',
        purchasePrice: 50000,
        salePrice: 70000,
        stock: 50,
        minStockLevel: 10,
        unit: 'bag',
        barcode: '8934563123459',
      },
      {
        name: 'Cooking Oil 1L',
        sku: 'OIL-1L',
        description: 'Vegetable cooking oil',
        category: 'Food',
        purchasePrice: 35000,
        salePrice: 45000,
        stock: 60,
        minStockLevel: 15,
        unit: 'bottle',
        barcode: '8934563123460',
      },
      {
        name: 'Sugar 1kg',
        sku: 'SUGAR-1KG',
        description: 'White refined sugar',
        category: 'Food',
        purchasePrice: 15000,
        salePrice: 20000,
        stock: 40,
        minStockLevel: 10,
        unit: 'pack',
        barcode: '8934563123461',
      },
      {
        name: 'Salt 500g',
        sku: 'SALT-500G',
        description: 'Iodized salt',
        category: 'Food',
        purchasePrice: 5000,
        salePrice: 8000,
        stock: 100,
        minStockLevel: 20,
        unit: 'pack',
        barcode: '8934563123462',
      },
      {
        name: 'Laundry Detergent 3kg',
        sku: 'DETERGENT-3KG',
        description: 'Laundry washing powder',
        category: 'Household',
        purchasePrice: 80000,
        salePrice: 110000,
        stock: 30,
        minStockLevel: 10,
        unit: 'box',
        barcode: '8934563123463',
      },
      {
        name: 'Dish Soap 500ml',
        sku: 'SOAP-500ML',
        description: 'Dishwashing liquid',
        category: 'Household',
        purchasePrice: 15000,
        salePrice: 22000,
        stock: 70,
        minStockLevel: 15,
        unit: 'bottle',
        barcode: '8934563123464',
      },
      {
        name: 'Toilet Paper 10 Rolls',
        sku: 'PAPER-10R',
        description: 'Soft toilet tissue',
        category: 'Household',
        purchasePrice: 40000,
        salePrice: 55000,
        stock: 45,
        minStockLevel: 10,
        unit: 'pack',
        barcode: '8934563123465',
      },
      {
        name: 'Shampoo 200ml',
        sku: 'SHAMPOO-200',
        description: 'Hair shampoo',
        category: 'Personal Care',
        purchasePrice: 25000,
        salePrice: 35000,
        stock: 60,
        minStockLevel: 15,
        unit: 'bottle',
        barcode: '8934563123466',
      },
      {
        name: 'Toothpaste 100g',
        sku: 'PASTE-100',
        description: 'Mint toothpaste',
        category: 'Personal Care',
        purchasePrice: 18000,
        salePrice: 25000,
        stock: 80,
        minStockLevel: 20,
        unit: 'tube',
        barcode: '8934563123467',
      },
      {
        name: 'Milk 1L',
        sku: 'MILK-1L',
        description: 'Fresh milk',
        category: 'Dairy',
        purchasePrice: 28000,
        salePrice: 38000,
        stock: 40,
        minStockLevel: 10,
        unit: 'carton',
        barcode: '8934563123468',
      },
      {
        name: 'Yogurt 4 Cups',
        sku: 'YOGURT-4',
        description: 'Strawberry yogurt',
        category: 'Dairy',
        purchasePrice: 22000,
        salePrice: 30000,
        stock: 35,
        minStockLevel: 10,
        unit: 'pack',
        barcode: '8934563123469',
      },
      {
        name: 'Eggs 10 pcs',
        sku: 'EGG-10',
        description: 'Fresh chicken eggs',
        category: 'Food',
        purchasePrice: 30000,
        salePrice: 40000,
        stock: 25,
        minStockLevel: 10,
        unit: 'pack',
        barcode: '8934563123470',
      },
    ];

    for (const product of products) {
      try {
        await dichVuSanPham.create(product);
        logger.log(`✅ Product created: ${product.name}`);
      } catch (error) {
        logger.warn(`⚠️  Product already exists: ${product.name}`);
      }
    }

    logger.log('\n🎉 Database seeding completed successfully!');
    logger.log('\n📝 Test Credentials:');
    logger.log('   Admin: admin@taphoa.com / admin123');
    logger.log('   Staff: staff@taphoa.com / staff123');
    logger.log('   Manager: manager@taphoa.com / manager123');
    logger.log('   Accountant: accountant@taphoa.com / accountant123');
    logger.log('\n🚀 Start the server with: npm run start:dev');
    logger.log('📚 API Docs: http://localhost:4000/api/docs\n');
  } catch (error) {
    logger.error('❌ Error seeding database:', error.message);
  } finally {
    await app.close();
  }
}

gieoDuLieu();

