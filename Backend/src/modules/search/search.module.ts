import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { SearchLog, SearchLogSchema } from './schemas/search-log.schema';
import { ProductsModule } from '../products/products.module';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: SearchLog.name, schema: SearchLogSchema }]),
    ProductsModule,
    CategoriesModule,
  ],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService, MongooseModule],
})
export class SearchModule {}
