import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BlacklistedTokenDocument = BlacklistedToken & Document;

@Schema({ timestamps: true, collection: 'blacklisted_tokens' })
export class BlacklistedToken {
  @Prop({ required: true, unique: true })
  token: string;

  @Prop({ required: true, enum: ['access', 'refresh'] })
  tokenType: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true, enum: ['customer', 'admin'] })
  userType: string;

  @Prop()
  reason: string;

  @Prop({ required: true, index: { expires: 0 } })
  expiresAt: Date;
}

export const BlacklistedTokenSchema = SchemaFactory.createForClass(BlacklistedToken);

BlacklistedTokenSchema.statics.isTokenBlacklisted = async function(token: string) {
    return !!(await this.findOne({ token }));
};
