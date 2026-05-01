import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DownloadsService } from './downloads.service';
import { DownloadsController } from './downloads.controller';
import { ProductsModule } from '../products/products.module';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [
    ProductsModule,
    OrdersModule,
  ],
  controllers: [DownloadsController],
  providers: [DownloadsService],
  exports: [DownloadsService],
})
export class DownloadsModule {}
