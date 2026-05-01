import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RequestSignatureDocument = RequestSignature & Document;

@Schema({ timestamps: false, collection: 'requestSignatures' })
export class RequestSignature {
  @Prop({ required: true, unique: true })
  signature: string;

  @Prop({ required: true })
  endpoint: string;

  @Prop({ default: Date.now, expires: 120 }) // TTL: 2 minutes
  createdAt: Date;
}

export const RequestSignatureSchema = SchemaFactory.createForClass(RequestSignature);
