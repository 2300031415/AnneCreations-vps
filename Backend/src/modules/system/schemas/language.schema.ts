import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LanguageDocument = Language & Document;

@Schema({ timestamps: true, collection: 'languages' })
export class Language {
  @Prop({ required: true, trim: true, maxlength: 100 })
  name: string;

  @Prop({ required: true, unique: true, trim: true, lowercase: true, maxlength: 10 })
  code: string;

  @Prop({ trim: true, maxlength: 50 })
  locale: string;

  @Prop({ trim: true })
  image: string;

  @Prop({ trim: true, maxlength: 100 })
  directory: string;

  @Prop({ default: 0, min: 0 })
  sortOrder: number;

  @Prop({ default: true })
  status: boolean;
}

export const LanguageSchema = SchemaFactory.createForClass(Language);

LanguageSchema.index({ sortOrder: 1 });
LanguageSchema.index({ code: 1 });

LanguageSchema.virtual('displayName').get(function (this: any) {
  return `${this.name} (${this.code})`;
});

LanguageSchema.virtual('localeCode').get(function (this: any) {
  return this.locale || this.code;
});
