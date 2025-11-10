import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PurchaseService } from './purchase.service';
import { PurchaseRecommendationService } from './purchase-recommendation.service';
import { PurchaseController } from './purchase.controller';
import { Purchase, PurchaseSchema } from './schemas/purchase.schema';
import { Order, OrderSchema } from '../order/schemas/order.schema';
import { Product, ProductSchema } from '../product/schemas/product.schema';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Purchase.name, schema: PurchaseSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
    ProductModule,
  ],
  controllers: [PurchaseController],
  providers: [PurchaseService, PurchaseRecommendationService],
  exports: [PurchaseService],
})
export class PurchaseModule {}

