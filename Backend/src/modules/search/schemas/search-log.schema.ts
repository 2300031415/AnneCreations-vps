import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type SearchLogDocument = SearchLog & Document;

@Schema({ timestamps: true, collection: 'searchLogs' })
export class SearchLog {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Customer' })
  customerId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, trim: true, maxlength: 255 })
  searchTerm: string;

  @Prop({ default: 0, min: 0 })
  resultsCount: number;

  @Prop({ default: 0, min: 0 })
  searchTime: number;

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  filters: any;

  @Prop({ trim: true, maxlength: 50 })
  sortBy: string;

  @Prop({ trim: true, maxlength: 45 })
  ipAddress: string;

  @Prop({ trim: true, maxlength: 500 })
  userAgent: string;

  @Prop({ trim: true, maxlength: 100 })
  sessionId: string;
}

export const SearchLogSchema = SchemaFactory.createForClass(SearchLog);

SearchLogSchema.index({ customerId: 1 });
SearchLogSchema.index({ searchTerm: 1 });
SearchLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 }); // TTL: 90 days
