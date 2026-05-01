import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ProductOptionValueSchema, ProductOptionValue } from '../../products/schemas/product.schema';

export type CartDocument = Cart & Document;

@Schema({ timestamps: true })
export class CartItem {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Product' })
  product: MongooseSchema.Types.ObjectId;

  @Prop({ type: [ProductOptionValueSchema], default: [] })
  options: ProductOptionValue[];

  @Prop({ required: true, min: 0 })
  subtotal: number;
}
export const CartItemSchema = SchemaFactory.createForClass(CartItem);

@Schema({ timestamps: true, collection: 'carts' })
export class Cart {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Customer' })
  customerId: MongooseSchema.Types.ObjectId;

  @Prop({ type: [CartItemSchema], default: [] })
  items: CartItem[];
}

export const CartSchema = SchemaFactory.createForClass(Cart);

CartSchema.index({ customerId: 1 });
CartSchema.index({ 'items.product': 1 });

CartSchema.virtual('itemCount').get(function (this: any) {
  return this.items?.length || 0;
});

CartSchema.virtual('subtotal').get(function (this: any) {
  if (!this.items || !Array.isArray(this.items)) return 0;
  return this.items.reduce((total: number, item: any) => total + (item.subtotal || 0), 0);
});

CartSchema.virtual('isEmpty').get(function (this: any) {
  return !this.items || this.items.length === 0;
});

CartSchema.pre('save', function (this: any, next: any) {
  if (this.items && Array.isArray(this.items) && this.items.length > 0) {
    this.items.forEach((item: any) => {
      let itemSubtotal = 0;
      if (item.options && Array.isArray(item.options) && item.options.length > 0) {
        item.options.forEach((option: any) => {
          if (option.price && typeof option.price === 'number') {
            itemSubtotal += option.price;
          }
        });
      }
      item.subtotal = itemSubtotal;
    });
  }
  if (typeof next === 'function') {
    next();
  }
});
