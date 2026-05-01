import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WishlistService } from './wishlist.service';
import { WishlistController } from './wishlist.controller';
import { Wishlist, WishlistSchema } from './schemas/wishlist.schema';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Wishlist.name, schema: WishlistSchema }]),
    ProductsModule,
  ],
  controllers: [WishlistController],
  providers: [WishlistService],
  exports: [WishlistService, MongooseModule],
})
export class WishlistModule {}
