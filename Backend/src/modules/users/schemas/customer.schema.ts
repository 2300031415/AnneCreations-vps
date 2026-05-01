import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type CustomerDocument = Customer & Document;

@Schema()
export class Address {
  @Prop({ trim: true, maxlength: 100 })
  firstName: string;

  @Prop({ trim: true, maxlength: 100 })
  lastName: string;

  @Prop({ trim: true, maxlength: 200 })
  company: string;

  @Prop({ trim: true, maxlength: 255 })
  addressLine1: string;

  @Prop({ trim: true, maxlength: 255 })
  addressLine2: string;

  @Prop({ trim: true, maxlength: 100 })
  city: string;

  @Prop({ trim: true, maxlength: 20 })
  postcode: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Country', required: true })
  country: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Zone' })
  zone: MongooseSchema.Types.ObjectId;

  @Prop({ default: false })
  preferedBillingAddress: boolean;
}
export const AddressSchema = SchemaFactory.createForClass(Address);

@Schema({ timestamps: true, collection: 'customers' })
export class Customer {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Language' })
  languageId: MongooseSchema.Types.ObjectId;

  @Prop({ trim: true, maxlength: 100 })
  firstName: string;

  @Prop({ trim: true, maxlength: 100 })
  lastName: string;

  @Prop({ unique: true, sparse: true, lowercase: true, trim: true, maxlength: 255 })
  email: string;

  @Prop({ required: true, trim: true, maxlength: 20 })
  mobile: string;

  @Prop({ required: true, minlength: 6 })
  password: string;

  @Prop({ required: true })
  salt: string;

  @Prop({ default: false })
  newsletter: boolean;

  @Prop({ trim: true, maxlength: 45 })
  ipAddress: string;

  @Prop({ default: true })
  status: boolean;

  @Prop({ default: false })
  mobileVerified: boolean;

  @Prop({ default: false })
  emailVerified: boolean;

  @Prop({ trim: true })
  resetToken: string;

  @Prop({ trim: true })
  emailVerificationToken: string;

  @Prop()
  emailVerificationExpires: Date;

  @Prop({ type: [AddressSchema], default: [] })
  addresses: Address[];

  @Prop()
  lastLogin: Date;

  @Prop({ trim: true, maxlength: 45 })
  lastIp: string;

  @Prop({ default: 0, min: 0 })
  totalLogins: number;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);

CustomerSchema.index({ firstName: 1 });
CustomerSchema.index({ lastName: 1 });
CustomerSchema.index({ mobile: 1 });
CustomerSchema.index({ lastLogin: -1 });
CustomerSchema.index({ emailVerificationToken: 1 });
CustomerSchema.index({ firstName: 1, lastName: 1 });
CustomerSchema.index({ mobile: 1, status: 1 });
CustomerSchema.index({ firstName: 'text', lastName: 'text', email: 'text', mobile: 'text' });

CustomerSchema.virtual('fullName').get(function () {
  return `${this.firstName || ''} ${this.lastName || ''}`.trim();
});

CustomerSchema.virtual('primaryAddress').get(function () {
  const addresses = this.addresses as Address[];
  if (!addresses || addresses.length === 0) return null;
  return addresses.find(addr => addr.preferedBillingAddress) || addresses[0];
});
