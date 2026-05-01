import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Product, ProductSchema } from './schemas/product.schema';
import { ProductOption, ProductOptionSchema } from './schemas/product-option.schema';
import { Order, OrderSchema } from '../orders/schemas/order.schema';
import { Review, ReviewSchema } from '../reviews/schemas/review.schema';
import { SystemModule } from '../system/system.module';
import { LanguagesModule } from '../languages/languages.module';
import { SalesModule } from '../sales/sales.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: ProductOption.name, schema: ProductOptionSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Review.name, schema: ReviewSchema },
    ]),
    SystemModule,
    LanguagesModule,
    SalesModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService, MongooseModule],
})
export class ProductsModule {}
