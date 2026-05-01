import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type CouponUsageDocument = CouponUsage & Document;

@Schema({ timestamps: true, collection: 'couponUsage' })
export class CouponUsage {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Coupon', required: true })
  coupon: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Customer', required: true })
  customer: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Order', required: true, unique: true })
  order: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, min: 0 })
  discountAmount: number;

  @Prop({ required: true, min: 0 })
  orderTotal: number;

  @Prop({ default: Date.now })
  usedAt: Date;
}

export const CouponUsageSchema = SchemaFactory.createForClass(CouponUsage);

CouponUsageSchema.index({ coupon: 1, customer: 1 });
CouponUsageSchema.index({ coupon: 1, usedAt: -1 });
CouponUsageSchema.index({ customer: 1, usedAt: -1 });
CouponUsageSchema.index({ coupon: 1 });
CouponUsageSchema.index({ usedAt: -1 });
