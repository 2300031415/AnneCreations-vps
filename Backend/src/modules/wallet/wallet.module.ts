import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { Wallet, WalletSchema, WalletTransaction, WalletTransactionSchema } from './schemas/wallet.schema';
import { OrdersModule } from '../orders/orders.module';
import { CartModule } from '../cart/cart.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Wallet.name, schema: WalletSchema },
      { name: WalletTransaction.name, schema: WalletTransactionSchema },
    ]),
    OrdersModule,
    CartModule,
  ],
  controllers: [WalletController],
  providers: [WalletService],
  exports: [WalletService, MongooseModule],
})
export class WalletModule {}
