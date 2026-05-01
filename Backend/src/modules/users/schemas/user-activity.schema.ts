import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type UserActivityDocument = UserActivity & Document;

@Schema({ timestamps: true, collection: 'userActivities' })
export class UserActivity {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Customer' })
  customer: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, trim: true, maxlength: 100 })
  action: string;

  @Prop({
    enum: [
      'Product',
      'Order',
      'Customer',
      'Category',
      'Cart',
      'Wishlist',
      'Search',
      'Auth',
      'Other',
    ],
    trim: true,
    maxlength: 50,
  })
  entityType: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Product' })
  productId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Order' })
  orderId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Category' })
  categoryId: MongooseSchema.Types.ObjectId;

  @Prop({ trim: true, maxlength: 100 })
  entityId: string;

  @Prop({ type: MongooseSchema.Types.Mixed })
  activityData: any;

  @Prop({ trim: true, maxlength: 45 })
  ipAddress: string;

  @Prop({ trim: true, maxlength: 500 })
  userAgent: string;

  @Prop({ trim: true, maxlength: 100 })
  browserId: string;

  @Prop({ enum: ['web', 'mobile'], default: 'web' })
  source: string;

  @Prop({ default: Date.now })
  lastActivity: Date;
}

export const UserActivitySchema = SchemaFactory.createForClass(UserActivity);

UserActivitySchema.index({ customer: 1 });
UserActivitySchema.index({ action: 1 });
UserActivitySchema.index({ entityType: 1 });
UserActivitySchema.index({ productId: 1 });
UserActivitySchema.index({ orderId: 1 });
UserActivitySchema.index({ categoryId: 1 });
UserActivitySchema.index({ entityId: 1 });
UserActivitySchema.index({ browserId: 1 });
UserActivitySchema.index({ lastActivity: -1 });
UserActivitySchema.index({ source: 1 });
