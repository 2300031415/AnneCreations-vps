import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';
import { SaleConfig, SaleConfigSchema } from './schemas/sale-config.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: SaleConfig.name, schema: SaleConfigSchema }]),
  ],
  controllers: [SalesController],
  providers: [SalesService],
  exports: [SalesService],
})
export class SalesModule {}
