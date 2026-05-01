import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { Cart, CartSchema } from './schemas/cart.schema';
import { ProductsModule } from '../products/products.module';
import { OrdersModule } from '../orders/orders.module';
import { SalesModule } from '../sales/sales.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Cart.name, schema: CartSchema }]),
    ProductsModule,
    OrdersModule,
    SalesModule,
  ],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService, MongooseModule],
})
export class CartModule {}
