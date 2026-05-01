import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type WalletDocument = Wallet & Document;

@Schema({ timestamps: true, collection: 'wallets' })
export class Wallet {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Customer', required: true, unique: true })
  user: MongooseSchema.Types.ObjectId;

  @Prop({ default: 0, min: 0 })
  balance: number;

  @Prop({ default: 'INR' })
  currency: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const WalletSchema = SchemaFactory.createForClass(Wallet);

// Wallet Transaction Schema
export type WalletTransactionDocument = WalletTransaction & Document;

@Schema({ timestamps: true, collection: 'walletTransactions' })
export class WalletTransaction {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Wallet', required: true })
  wallet: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Customer', required: true })
  user: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true, enum: ['CREDIT', 'DEBIT'] })
  type: string;

  @Prop({ required: true })
  description: string;

  @Prop()
  referenceId: string;

  @Prop({ enum: ['PENDING', 'COMPLETED', 'FAILED'], default: 'COMPLETED' })
  status: string;
}

export const WalletTransactionSchema = SchemaFactory.createForClass(WalletTransaction);
