import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema()
export class AdditionalImage {
  @Prop({ required: true })
  image: string;

  @Prop({ default: 0, min: 0 })
  sortOrder: number;
}
export const AdditionalImageSchema = SchemaFactory.createForClass(AdditionalImage);

@Schema()
export class ProductOptionValue {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'ProductOption', required: true })
  option: MongooseSchema.Types.ObjectId;

  @Prop({ default: 0, min: 0 })
  price: number;

  @Prop({ required: true })
  uploadedFilePath: string;

  @Prop({ default: 0, min: 0 })
  downloadCount: number;

  @Prop({ default: 0, min: 0 })
  fileSize: number;

  @Prop({ default: 'application/octet-stream', trim: true })
  mimeType: string;
}
export const ProductOptionValueSchema = SchemaFactory.createForClass(ProductOptionValue);

@Schema({ _id: false })
export class SeoData {
  @Prop({ trim: true, maxlength: 255 })
  metaTitle: string;

  @Prop({ trim: true, maxlength: 500 })
  metaDescription: string;

  @Prop({ trim: true, maxlength: 500 })
  metaKeyword: string;
}
export const SeoDataSchema = SchemaFactory.createForClass(SeoData);

@Schema({ timestamps: true, collection: 'products' })
export class Product {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Language' })
  languageId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, trim: true, maxlength: 255 })
  productModel: string;

  @Prop({ required: true, trim: true, maxlength: 100 })
  sku: string;

  @Prop({ trim: true, maxlength: 2000 })
  description: string;

  @Prop({ trim: true, maxlength: 100 })
  stitches: string;

  @Prop({ trim: true, maxlength: 100 })
  dimensions: string;

  @Prop({ trim: true, maxlength: 100 })
  colourNeedles: string;

  @Prop({ default: 0, min: 0 })
  backStitches: number;

  @Prop({ default: 0, min: 0 })
  handStitches: number;

  @Prop({ default: 0, min: 0 })
  frontStitches: number;

  @Prop({ default: 0, min: 0 })
  overallStitches: number;

  @Prop({ default: 0, min: 0 })
  sortOrder: number;

  @Prop({ default: true })
  status: boolean;

  @Prop({ default: 0, min: 0 })
  viewed: number;

  @Prop({ default: 0, min: 0 })
  salesCount: number;

  @Prop({ default: 0, min: 0 })
  weeklySalesCount: number;

  @Prop({ trim: true })
  image: string;

  @Prop({ type: SeoDataSchema })
  seo: SeoData;

  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'Category', default: [] })
  categories: MongooseSchema.Types.ObjectId[];

  @Prop({ default: false })
  todayDeal: boolean;

  @Prop()
  todayDealExpiry: Date;

  @Prop({ default: false })
  activeDiscount: boolean;

  @Prop({ type: [AdditionalImageSchema], default: [] })
  additionalImages: AdditionalImage[];

  @Prop({ type: [ProductOptionValueSchema], default: [] })
  options: ProductOptionValue[];
}

export const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.index({ productModel: 1 });
ProductSchema.index({ sku: 1 });
ProductSchema.index({ languageId: 1 });
ProductSchema.index({ categories: 1 });
ProductSchema.index({ sortOrder: 1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ productModel: 'text', sku: 'text', description: 'text', 'seo.metaKeyword': 'text' });
