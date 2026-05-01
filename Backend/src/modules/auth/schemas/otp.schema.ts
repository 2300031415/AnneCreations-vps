import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OtpDocument = Otp & Document;

@Schema({ timestamps: true, collection: 'otps' })
export class Otp {
  @Prop({ required: true })
  mobile: string;

  @Prop({ required: true })
  code: string;

  @Prop({ default: 'pending', enum: ['pending', 'verified', 'expired'] })
  status: string;

  @Prop({ required: true, index: { expires: 300 } }) // Expire in 5 minutes
  createdAt: Date;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);
