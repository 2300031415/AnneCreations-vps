import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AuditLogDocument = AuditLog & Document;

@Schema({ timestamps: true, collection: 'audit_logs' })
export class AuditLog {
  @Prop({ required: true })
  action: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true, enum: ['admin', 'customer', 'system'] })
  userType: string;

  @Prop({ required: true })
  entityType: string;

  @Prop()
  entityId: string;

  @Prop({ type: Object })
  oldValue: any;

  @Prop({ type: Object })
  newValue: any;

  @Prop()
  ipAddress: string;

  @Prop()
  userAgent: string;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

AuditLogSchema.index({ action: 1 });
AuditLogSchema.index({ userId: 1 });
AuditLogSchema.index({ entityType: 1, entityId: 1 });
AuditLogSchema.index({ createdAt: -1 });
