import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true, collection: 'sale_configs' })
export class SaleConfig extends Document {
  @Prop({ default: false })
  isActive: boolean;

  @Prop({ default: 0 })
  discountPercentage: number;

  @Prop()
  expiryDate: Date;

  @Prop({ type: MongooseSchema.Types.Mixed, default: 'ALL' })
  targetCategories: string[] | 'ALL';
}

export const SaleConfigSchema = SchemaFactory.createForClass(SaleConfig);
