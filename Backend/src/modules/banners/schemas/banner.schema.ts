import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BannerDocument = Banner & Document;

@Schema()
export class BannerImage {
  @Prop({ required: true, trim: true, maxlength: 500 })
  image: string;

  @Prop({ default: true })
  status: boolean;
}
export const BannerImageSchema = SchemaFactory.createForClass(BannerImage);

@Schema({ timestamps: true, collection: 'banners' })
export class Banner {
  @Prop({ required: true, trim: true, maxlength: 255 })
  title: string;

  @Prop({ trim: true, maxlength: 500 })
  description: string;

  @Prop({ required: true, enum: ['mobile', 'web'], trim: true })
  deviceType: string;

  @Prop({ type: [BannerImageSchema], default: [] })
  images: BannerImage[];

  @Prop({ default: 0, min: 0 })
  sortOrder: number;

  @Prop({ default: true })
  status: boolean;
}

export const BannerSchema = SchemaFactory.createForClass(Banner);

BannerSchema.index({ sortOrder: 1 });
BannerSchema.index({ 'images.status': 1 });
BannerSchema.index({ deviceType: 1 });

BannerSchema.methods.hasActiveImages = function () {
  return this.images && this.images.some((img: BannerImage) => img.status === true);
};
