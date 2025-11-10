import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { TransactionModule } from '../transaction/transaction.module';
import { OrderModule } from '../order/order.module';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [TransactionModule, OrderModule, ProductModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}

