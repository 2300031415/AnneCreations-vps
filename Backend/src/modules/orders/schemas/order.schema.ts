import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ProductOptionValueSchema, ProductOptionValue } from '../../products/schemas/product.schema';

export type OrderDocument = Order & Document;

@Schema({ _id: false })
export class OrderProduct {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Product', required: true })
  product: MongooseSchema.Types.ObjectId;

  @Prop({ type: [ProductOptionValueSchema], default: [] })
  options: ProductOptionValue[];
}
export const OrderProductSchema = SchemaFactory.createForClass(OrderProduct);

@Schema({ _id: false })
export class OrderTotal {
  @Prop({ required: true, trim: true, maxlength: 50, enum: ['total', 'subtotal', 'couponDiscount'] })
  code: string;

  @Prop({ required: true, min: 0 })
  value: number;

  @Prop({ default: 0, min: 0 })
  sortOrder: number;
}
export const OrderTotalSchema = SchemaFactory.createForClass(OrderTotal);

@Schema({ _id: false, timestamps: true })
export class OrderHistory {
  @Prop({ enum: ['pending', 'paid', 'cancelled', 'refunded', 'failed', 'authorized'], default: 'pending' })
  orderStatus: string;

  @Prop({ default: '', trim: true, maxlength: 1000 })
  comment: string;

  @Prop({ default: false })
  notify: boolean;
}
export const OrderHistorySchema = SchemaFactory.createForClass(OrderHistory);

@Schema({ timestamps: true, collection: 'orders' })
export class Order {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Customer' })
  customer: MongooseSchema.Types.ObjectId;

  @Prop({ trim: true, maxlength: 100 })
  paymentFirstName: string;

  @Prop({ trim: true, maxlength: 100 })
  paymentLastName: string;

  @Prop({ trim: true, maxlength: 200 })
  paymentCompany: string;

  @Prop({ trim: true, maxlength: 255 })
  paymentAddress1: string;

  @Prop({ trim: true, maxlength: 255 })
  paymentAddress2: string;

  @Prop({ trim: true, maxlength: 100 })
  paymentCity: string;

  @Prop({ trim: true, maxlength: 20 })
  paymentPostcode: string;

  @Prop({ trim: true, maxlength: 100 })
  paymentCountry: string;

  @Prop({ trim: true, maxlength: 100 })
  paymentZone: string;

  @Prop({ trim: true, maxlength: 1000 })
  paymentAddressFormat: string;

  @Prop({ required: true, trim: true, maxlength: 100 })
  paymentMethod: string;

  @Prop({ required: true, trim: true, maxlength: 100 })
  paymentCode: string;

  @Prop({ required: true, min: 0 })
  orderTotal: number;

  @Prop({ enum: ['pending', 'paid', 'cancelled', 'refunded', 'failed', 'authorized'], default: 'pending' })
  orderStatus: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Language' })
  languageId: MongooseSchema.Types.ObjectId;

  @Prop({ trim: true, maxlength: 45 })
  ipAddress: string;

  @Prop({ trim: true, maxlength: 45 })
  forwardedIp: string;

  @Prop({ trim: true, maxlength: 500 })
  userAgent: string;

  @Prop({ trim: true, maxlength: 200 })
  acceptLanguageId: string;

  @Prop({ enum: ['mobile', 'web'], default: 'mobile', trim: true })
  source: string;

  @Prop({ type: [OrderProductSchema], default: [] })
  products: OrderProduct[];

  @Prop({ type: [OrderTotalSchema], default: [] })
  totals: OrderTotal[];

  @Prop({ type: [OrderHistorySchema], default: [] })
  history: OrderHistory[];

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Coupon' })
  coupon: MongooseSchema.Types.ObjectId;

  @Prop({ trim: true, maxlength: 100 })
  razorpayOrderId: string;

  @Prop({ unique: true, sparse: true, trim: true })
  orderNumber: string;

  createdAt: Date;
  updatedAt: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

OrderSchema.index({ customer: 1, createdAt: -1 });
OrderSchema.index({ customer: 1, orderStatus: 1 });
OrderSchema.index({ orderStatus: 1 });
OrderSchema.index({ orderTotal: 1 });
OrderSchema.index({ 'products.product': 1 });

OrderSchema.virtual('customerFullName').get(function (this: any) {
  return `${this.paymentFirstName || ''} ${this.paymentLastName || ''}`.trim();
});

OrderSchema.virtual('isDownloadable').get(function (this: any) {
  return this.orderStatus === 'paid' && this.products && this.products.length > 0;
});
