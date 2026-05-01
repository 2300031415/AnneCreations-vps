import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Feature, PermissionAction } from '../enums/role.enum';

export type RoleDocument = Role & Document;

@Schema({ _id: false })
export class FeaturePermission {
  @Prop({ required: true, enum: Object.values(Feature) })
  feature: string;

  @Prop({ default: false })
  create: boolean;

  @Prop({ default: false })
  read: boolean;

  @Prop({ default: false })
  update: boolean;

  @Prop({ default: false })
  delete: boolean;
}
export const FeaturePermissionSchema = SchemaFactory.createForClass(FeaturePermission);

@Schema({ timestamps: true, collection: 'roles' })
export class Role {
  @Prop({ required: true, unique: true, trim: true, minlength: 2, maxlength: 50 })
  name: string;

  @Prop({ trim: true, maxlength: 500 })
  description: string;

  @Prop({ type: [FeaturePermissionSchema], default: [] })
  permissions: FeaturePermission[];

  @Prop({ default: true })
  status: boolean;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Admin' })
  createdBy: MongooseSchema.Types.ObjectId;
}

export const RoleSchema = SchemaFactory.createForClass(Role);

RoleSchema.index({ createdBy: 1 });

RoleSchema.methods.hasPermission = function (this: RoleDocument, feature: Feature, action: PermissionAction): boolean {
  const featurePermission = this.permissions.find((p: any) => p.feature === feature);
  if (!featurePermission) return false;
  return (featurePermission as any)[action] === true;
};
