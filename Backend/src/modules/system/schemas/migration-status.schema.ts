import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MigrationStatusDocument = MigrationStatus & Document;

@Schema({ timestamps: true, collection: 'migration_status' })
export class MigrationStatus {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true, enum: ['pending', 'inProgress', 'completed', 'failed'] })
  status: string;

  @Prop()
  duration: number;

  @Prop()
  error: string;

  @Prop({ type: Object })
  details: any;
}

export const MigrationStatusSchema = SchemaFactory.createForClass(MigrationStatus);
