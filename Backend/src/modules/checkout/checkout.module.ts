import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CheckoutService } from './checkout.service';
import { CheckoutController } from './checkout.controller';
import { CartModule } from '../cart/cart.module';
import { OrdersModule } from '../orders/orders.module';
import { CouponsModule } from '../coupons/coupons.module';
import { Counter, CounterSchema } from '../../models/counter.model';
import { SalesModule } from '../sales/sales.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Counter.name, schema: CounterSchema }]),
    CartModule,
    OrdersModule,
    CouponsModule,
    SalesModule,
  ],
  controllers: [CheckoutController],
  providers: [CheckoutService],
  exports: [CheckoutService],
})
export class CheckoutModule {}
