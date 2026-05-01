import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type CouponDocument = Coupon & Document;

@Schema({ timestamps: true, collection: 'coupons' })
export class Coupon {
  @Prop({ required: true, trim: true, maxlength: 255 })
  name: string;

  @Prop({ required: true, unique: true, trim: true, uppercase: true, maxlength: 50 })
  code: string;

  @Prop({ enum: ['F', 'P'], default: 'P' })
  type: string;

  @Prop({ required: true, min: 0 })
  discount: number;

  @Prop({ default: false })
  logged: boolean;

  @Prop({ default: 0, min: 0 })
  minAmount: number;

  @Prop({ default: 0, min: 0 })
  maxDiscount: number;

  @Prop({ default: Date.now })
  dateStart: Date;

  @Prop()
  dateEnd: Date;

  @Prop({ default: 1, min: 0 })
  totalUses: number;

  @Prop({ default: 1, min: 0 })
  customerUses: number;

  @Prop({ default: false })
  autoApply: boolean;

  @Prop({ default: true })
  status: boolean;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Language' })
  languageId: MongooseSchema.Types.ObjectId;
}

export const CouponSchema = SchemaFactory.createForClass(Coupon);

CouponSchema.index({ status: 1, dateStart: 1, dateEnd: 1 });
CouponSchema.index({ dateStart: 1 });
CouponSchema.index({ dateEnd: 1 });
CouponSchema.index({ type: 1 });
CouponSchema.index({ languageId: 1 });
CouponSchema.index({ autoApply: 1, status: 1 });

CouponSchema.pre('validate', function (this: any, next: any) {
  if (this.dateStart && this.dateEnd && this.dateEnd <= this.dateStart) {
    if (typeof next === 'function') {
        next(new Error('End date must be after start date'));
    }
  } else if (typeof next === 'function') {
    next();
  }
});

CouponSchema.virtual('discountDisplay').get(function (this: any) {
  return this.type === 'P' ? `${this.discount}%` : `₹ ${this.discount}`;
});

CouponSchema.virtual('isValid').get(function (this: any) {
  const now = new Date();
  return this.status && this.dateStart <= now && (!this.dateEnd || this.dateEnd >= now);
});

CouponSchema.virtual('isExpired').get(function (this: any) {
  const now = new Date();
  return this.dateEnd && this.dateEnd < now;
});
