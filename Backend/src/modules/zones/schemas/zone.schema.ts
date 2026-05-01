import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Country } from '../../countries/schemas/country.schema';

export type ZoneDocument = Zone & Document;

@Schema({ timestamps: true, collection: 'zones' })
export class Zone {
  @Prop({ type: Types.ObjectId, ref: 'Country', required: true })
  country: Types.ObjectId | Country;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true, uppercase: true })
  code: string;

  @Prop({ default: true })
  status: boolean;
}

export const ZoneSchema = SchemaFactory.createForClass(Zone);

ZoneSchema.index({ country: 1 });
ZoneSchema.index({ code: 1 });
