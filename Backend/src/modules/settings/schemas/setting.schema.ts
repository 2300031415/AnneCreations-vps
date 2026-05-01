import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type SettingDocument = Setting & Document;

@Schema({ timestamps: true, collection: 'settings' })
export class Setting {
  @Prop({ required: true, unique: true, trim: true })
  key: string;

  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  value: any;

  @Prop({ trim: true })
  description: string;
}

export const SettingSchema = SchemaFactory.createForClass(Setting);
