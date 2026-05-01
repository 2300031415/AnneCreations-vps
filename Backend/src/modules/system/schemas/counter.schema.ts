import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CounterDocument = Counter & Document;

@Schema({ timestamps: false, collection: 'counters' })
export class Counter {
  @Prop({ required: true })
  _id: string; // e.g., 'orderNumber'

  @Prop({ default: 0 })
  sequence_value: number;
}

export const CounterSchema = SchemaFactory.createForClass(Counter);
