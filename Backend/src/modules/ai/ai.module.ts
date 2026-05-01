import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { ProductsModule } from '../products/products.module';
import { OrdersModule } from '../orders/orders.module';
import { DownloadsModule } from '../downloads/downloads.module';

@Module({
  imports: [
    ProductsModule,
    OrdersModule,
    DownloadsModule,
  ],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
