import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type AuditLogDocument = AuditLog & Document;

@Schema({ timestamps: true, collection: 'auditLogs' })
export class AuditLog {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  user: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, enum: ['admin', 'customer'] })
  userType: string;

  @Prop({ trim: true, maxlength: 100 })
  username: string;

  @Prop({ trim: true, lowercase: true, maxlength: 255 })
  email: string;

  @Prop({ trim: true, maxlength: 45 })
  ipAddress: string;

  @Prop({ required: true, trim: true, maxlength: 255 })
  action: string;

  @Prop({
    required: true,
    enum: [
      'Product',
      'Customer',
      'Order',
      'Admin',
      'Category',
      'Language',
      'Country',
      'Zone',
      'Wishlist',
      'Cart',
      'SearchLog',
      'UserActivity',
      'OnlineUser',
    ],
  })
  entityType: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Product' })
  productId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Order' })
  orderId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Customer' })
  customerId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Category' })
  categoryId: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Admin' })
  adminId: MongooseSchema.Types.ObjectId;

  @Prop({ trim: true, maxlength: 100 })
  entityId: string;

  @Prop({ type: MongooseSchema.Types.Mixed })
  previousState: any;

  @Prop({ type: MongooseSchema.Types.Mixed })
  newState: any;

  @Prop({ trim: true, maxlength: 1000 })
  details: string;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

AuditLogSchema.index({ user: 1 });
AuditLogSchema.index({ userType: 1 });
AuditLogSchema.index({ action: 1 });
AuditLogSchema.index({ entityType: 1 });
AuditLogSchema.index({ productId: 1 });
AuditLogSchema.index({ orderId: 1 });
AuditLogSchema.index({ customerId: 1 });
AuditLogSchema.index({ categoryId: 1 });
AuditLogSchema.index({ adminId: 1 });
AuditLogSchema.index({ entityId: 1 });
AuditLogSchema.index({ ipAddress: 1 });
AuditLogSchema.index({ createdAt: -1 });

AuditLogSchema.virtual('userDisplayName').get(function (this: any) {
  return this.username || this.email || 'Unknown User';
});
