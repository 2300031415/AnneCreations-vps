import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ProductOptionDocument = ProductOption & Document;

@Schema({ timestamps: true, collection: 'productOptions' })
export class ProductOption {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Language', required: true })
  languageId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, trim: true, maxlength: 255 })
  name: string;

  @Prop({ default: 0, min: 0 })
  sortOrder: number;

  @Prop({ default: true })
  status: boolean;
}

export const ProductOptionSchema = SchemaFactory.createForClass(ProductOption);

ProductOptionSchema.index({ name: 1 });
ProductOptionSchema.index({ sortOrder: 1 });
ProductOptionSchema.index({ name: 'text' });
