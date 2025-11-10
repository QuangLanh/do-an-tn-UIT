import { Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { TransactionModule } from '../transaction/transaction.module';
import { OrderModule } from '../order/order.module';
import { PurchaseModule } from '../purchase/purchase.module';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [TransactionModule, OrderModule, PurchaseModule, ProductModule],
  controllers: [ReportController],
  providers: [ReportService],
  exports: [ReportService],
})
export class ReportModule {}

