
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { UngDungPhanHe } from './ung-dung.phan-he';
import { BoLocNgoaiLeHttp } from './dung-chung/bo-loc/bo-loc-ngoai-le-http';

async function bootstrap() {
  const app = await NestFactory.create(UngDungPhanHe);
  const logger = new Logger('Bootstrap');

  // Global prefix
  app.setGlobalPrefix('api');

  // CORS configuration - Allow both admin (5173) and customer (5174) frontends
  const allowedOrigins = process.env.FRONTEND_URLS
    ? process.env.FRONTEND_URLS.split(',').map(url => url.trim())
    : ['http://localhost:5173', 'http://localhost:5174'];
  
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new BoLocNgoaiLeHttp());

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('API Quản lý Cửa hàng Tạp hóa')
    .setDescription('Hệ thống backend phục vụ quản lý vận hành cửa hàng tại Việt Nam')
    .setVersion('1.0')
    .addTag('xac-thuc', 'Các điểm cuối xác thực')
    .addTag('nguoi-dung', 'Quản lý người dùng')
    .addTag('san-pham', 'Quản lý sản phẩm')
    .addTag('don-hang', 'Quản lý đơn hàng')
    .addTag('nhap-hang', 'Quản lý nhập hàng')
    .addTag('giao-dich', 'Thống kê giao dịch')
    .addTag('bao-cao', 'Báo cáo và xuất file')
    .addTag('bang-dieu-khien', 'Dữ liệu tổng quan dashboard')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port);

  logger.log(`🚀 Application is running on: http://localhost:${port}/api`);
  logger.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
}

bootstrap();

