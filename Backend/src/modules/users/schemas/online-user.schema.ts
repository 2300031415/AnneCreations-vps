import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type OnlineUserDocument = OnlineUser & Document;

@Schema()
export class SessionEntry {
  @Prop({ trim: true, maxlength: 1000 })
  url: string;

  @Prop({ trim: true, maxlength: 1000 })
  referrer: string;

  @Prop({ enum: ['guest', 'customer'], default: 'guest' })
  browsingPhase: string;
}
export const SessionEntrySchema = SchemaFactory.createForClass(SessionEntry);

@Schema()
export class SessionPhase {
  @Prop({ enum: ['guest', 'customer'], required: true })
  phase: string;

  @Prop({ required: true })
  startTime: Date;

  @Prop({ default: null })
  endTime: Date;

  @Prop({ default: 0 })
  pageViews: number;
}
export const SessionPhaseSchema = SchemaFactory.createForClass(SessionPhase);

@Schema()
export class IPHistoryEntry {
  @Prop({ trim: true, maxlength: 45 })
  ip: string;
}
export const IPHistoryEntrySchema = SchemaFactory.createForClass(IPHistoryEntry);

@Schema({ timestamps: true, collection: 'onlineUsers' })
export class OnlineUser {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Customer' })
  customer: MongooseSchema.Types.ObjectId;

  @Prop({ enum: ['customer', 'guest'], default: 'guest' })
  userType: string;

  @Prop({ required: true, unique: true, trim: true, maxlength: 100 })
  browserId: string;

  @Prop({ trim: true, maxlength: 45 })
  ipAddress: string;

  @Prop({ trim: true, maxlength: 500 })
  userAgent: string;

  @Prop({ enum: ['web', 'mobile'], default: 'web' })
  source: string;

  @Prop({ default: Date.now })
  lastActivity: Date;

  @Prop({ trim: true, maxlength: 1000 })
  pageUrl: string;

  @Prop({ type: [SessionEntrySchema], default: [] })
  sessionHistory: SessionEntry[];

  @Prop({ default: null })
  loginTime: Date;

  @Prop({ default: 0 })
  totalPageViews: number;

  @Prop({ default: 0 })
  guestPageViews: number;

  @Prop({ default: 0 })
  customerPageViews: number;

  @Prop({ type: [SessionPhaseSchema], default: [] })
  sessionPhases: SessionPhase[];

  @Prop({ type: [IPHistoryEntrySchema], default: [] })
  ipHistory: IPHistoryEntry[];
}

export const OnlineUserSchema = SchemaFactory.createForClass(OnlineUser);

OnlineUserSchema.index({ customer: 1 });
OnlineUserSchema.index({ userType: 1 });
OnlineUserSchema.index({ lastActivity: -1 });
OnlineUserSchema.index({ lastActivity: 1 }, { expireAfterSeconds: 1800 }); // TTL: 30 minutes
