import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { OrderModule } from '../order/order.module';
import { PurchaseModule } from '../purchase/purchase.module';

@Module({
  imports: [OrderModule, PurchaseModule],
  controllers: [TransactionController],
  providers: [TransactionService],
  exports: [TransactionService],
})
export class TransactionModule {}

