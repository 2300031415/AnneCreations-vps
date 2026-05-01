import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Wishlist, WishlistDocument } from './schemas/wishlist.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';

@Injectable()
export class WishlistService {
  constructor(
    @InjectModel(Wishlist.name) private wishlistModel: Model<WishlistDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async getWishlist(customerId: string) {
    let wishlist = await this.wishlistModel.findOne({ customerId: new Types.ObjectId(customerId) } as any);
    if (!wishlist) {
      wishlist = new this.wishlistModel({ customerId: new Types.ObjectId(customerId), items: [] });
      await wishlist.save();
    }

    const productIds = wishlist.items.map(item => item.product);
    const products = await this.productModel.find({
      _id: { $in: productIds },
      status: true,
    } as any)
      .populate('categories', 'name')
      .populate('options.option', 'name')
      .lean();

    const formattedProducts = products.map((product: any) => {
      const wishlistItem = wishlist.items.find(
        (item: any) => item.product.toString() === product._id.toString()
      );
      return {
        ...product,
        addedAt: (wishlistItem as any)?.createdAt,
      };
    });

    return {
      count: formattedProducts.length,
      products: formattedProducts,
    };
  }

  async addToWishlist(customerId: string, productId: string) {
    if (!Types.ObjectId.isValid(productId)) {
      throw new BadRequestException('Invalid product ID');
    }

    const product = await this.productModel.findOne({ _id: new Types.ObjectId(productId), status: true } as any);
    if (!product) throw new NotFoundException('Product not found');

    let wishlist = await this.wishlistModel.findOne({ customerId: new Types.ObjectId(customerId) } as any);
    if (!wishlist) {
      wishlist = new this.wishlistModel({ customerId: new Types.ObjectId(customerId), items: [] });
    }

    if (wishlist.items.some(item => item.product.toString() === productId)) {
      return { message: 'Product already in wishlist' };
    }

    wishlist.items.push({ product: new Types.ObjectId(productId) } as any);
    return await wishlist.save();
  }

  async removeFromWishlist(customerId: string, productId: string) {
    const wishlist = await this.wishlistModel.findOne({ customerId: new Types.ObjectId(customerId) } as any);
    if (!wishlist) throw new NotFoundException('Wishlist not found');

    wishlist.items = wishlist.items.filter(item => item.product.toString() !== productId);
    return await wishlist.save();
  }
}
