import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema({ timestamps: true, collection: 'categories' })
export class Category {
  @Prop({ required: true, trim: true, maxlength: 255 })
  name: string;

  @Prop({ trim: true, maxlength: 2000 })
  description: string;

  @Prop({ trim: true, maxlength: 255 })
  metaTitle: string;

  @Prop({ trim: true, maxlength: 500 })
  metaDescription: string;

  @Prop({ trim: true, maxlength: 500 })
  metaKeyword: string;

  @Prop({ trim: true, maxlength: 500 })
  image: string;

  @Prop({ default: 0, min: 0 })
  sortOrder: number;

  @Prop({ default: true })
  status: boolean;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Language' })
  languageId: MongooseSchema.Types.ObjectId;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

CategorySchema.index({ languageId: 1 });
CategorySchema.index({ sortOrder: 1 });
CategorySchema.index({ name: 'text', description: 'text' });
