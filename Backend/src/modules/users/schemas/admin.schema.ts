import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type AdminDocument = Admin & Document;

@Schema({ timestamps: true, collection: 'admins' })
export class Admin {
  @Prop({ required: true, unique: true, trim: true, minlength: 3, maxlength: 30 })
  username: string;

  @Prop({ required: true, minlength: 6 })
  password: string;

  @Prop({ required: true })
  salt: string;

  @Prop({ trim: true, maxlength: 50 })
  firstName: string;

  @Prop({ trim: true, maxlength: 50 })
  lastName: string;

  @Prop({ required: true, unique: true, trim: true, lowercase: true })
  email: string;

  @Prop({ trim: true, maxlength: 500 })
  image: string;

  @Prop({ trim: true, maxlength: 45 })
  ipAddress: string;

  @Prop({ default: true })
  status: boolean;

  @Prop()
  lastLogin: Date;

  @Prop({ trim: true, maxlength: 45 })
  lastIp: string;

  @Prop({ default: 0, min: 0 })
  totalLogins: number;

  @Prop({ trim: true })
  resetToken: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Role', default: null })
  role: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Admin' })
  createdBy: MongooseSchema.Types.ObjectId;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);

AdminSchema.index({ lastLogin: -1 });

AdminSchema.virtual('fullName').get(function () {
  return `${this.firstName || ''} ${this.lastName || ''}`.trim();
});
