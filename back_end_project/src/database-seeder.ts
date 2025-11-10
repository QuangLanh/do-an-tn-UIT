import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UserService } from './modules/user/user.service';
import { ProductService } from './modules/product/product.service';
import { UserRole } from './common/enums/user-role.enum';
import { Logger } from '@nestjs/common';

async function seed() {
  const logger = new Logger('DatabaseSeeder');
  const app = await NestFactory.createApplicationContext(AppModule);

  const userService = app.get(UserService);
  const productService = app.get(ProductService);

  try {
    logger.log('🌱 Starting database seeding...');

    // Create users
    logger.log('Creating users...');

    const adminUser = await userService.create({
      email: 'admin@taphoa.com',
      password: 'admin123',
      fullName: 'System Administrator',
      role: UserRole.ADMIN,
      phone: '0901234567',
      address: 'Ho Chi Minh City',
    }).catch(() => null);

    const staffUser = await userService.create({
      email: 'staff@taphoa.com',
      password: 'staff123',
      fullName: 'Nguyen Van A',
      role: UserRole.STAFF,
      phone: '0902345678',
      address: 'Ho Chi Minh City',
    }).catch(() => null);

    const managerUser = await userService.create({
      email: 'manager@taphoa.com',
      password: 'manager123',
      fullName: 'Tran Thi B',
      role: UserRole.MANAGER,
      phone: '0903456789',
      address: 'Hanoi',
    }).catch(() => null);

    const accountantUser = await userService.create({
      email: 'accountant@taphoa.com',
      password: 'accountant123',
      fullName: 'Le Van C',
      role: UserRole.ACCOUNTANT,
      phone: '0904567890',
      address: 'Ho Chi Minh City',
    }).catch(() => null);

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
        await productService.create(product);
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

seed();

