import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LanguageDocument = Language & Document;

@Schema({ timestamps: true, collection: 'languages' })
export class Language {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, trim: true, lowercase: true })
  code: string;

  @Prop({ trim: true })
  locale: string;

  @Prop({ trim: true })
  image: string;

  @Prop({ trim: true })
  directory: string;

  @Prop({ default: 0 })
  sortOrder: number;

  @Prop({ default: true })
  status: boolean;
}

export const LanguageSchema = SchemaFactory.createForClass(Language);

LanguageSchema.index({ sortOrder: 1 });
