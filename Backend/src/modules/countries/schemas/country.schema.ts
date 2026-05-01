import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CountryDocument = Country & Document;

@Schema({ timestamps: true, collection: 'countries' })
export class Country {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, trim: true, uppercase: true })
  isoCode2: string;

  @Prop({ trim: true, uppercase: true })
  isoCode3: string;

  @Prop({ trim: true })
  addressFormat: string;

  @Prop({ default: false })
  postcodeRequired: boolean;

  @Prop({ default: true })
  status: boolean;
}

export const CountrySchema = SchemaFactory.createForClass(Country);

CountrySchema.index({ name: 1 });
