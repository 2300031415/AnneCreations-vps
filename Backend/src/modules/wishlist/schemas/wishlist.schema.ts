import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type WishlistDocument = Wishlist & Document;

@Schema({ timestamps: true })
export class WishlistItem {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Product', required: true })
  product: MongooseSchema.Types.ObjectId;
}
export const WishlistItemSchema = SchemaFactory.createForClass(WishlistItem);

@Schema({ timestamps: true, collection: 'wishlists' })
export class Wishlist {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Customer', required: true })
  customerId: MongooseSchema.Types.ObjectId;

  @Prop({ type: [WishlistItemSchema], default: [] })
  items: WishlistItem[];
}

export const WishlistSchema = SchemaFactory.createForClass(Wishlist);

WishlistSchema.index({ customerId: 1 }, { unique: true });
WishlistSchema.index({ 'items.product': 1 });

WishlistSchema.virtual('itemCount').get(function (this: any) {
  return this.items?.length || 0;
});

WishlistSchema.virtual('isEmpty').get(function (this: any) {
  return !this.items || this.items.length === 0;
});

WishlistSchema.virtual('recentItems').get(function (this: any) {
  if (!this.items || !Array.isArray(this.items)) return [];
  return this.items
    .sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 5);
});
