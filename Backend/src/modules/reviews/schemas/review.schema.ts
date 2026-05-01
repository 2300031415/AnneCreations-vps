import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ReviewDocument = Review & Document;

@Schema({ timestamps: true, collection: 'reviews' })
export class Review {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Product', required: true })
  product: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Customer', required: true })
  user: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop({ trim: true, maxlength: 1000 })
  comment: string;

  @Prop({ default: true })
  status: boolean;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

ReviewSchema.index({ product: 1, user: 1 }, { unique: true });
