import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MigrationStatus, MigrationStatusSchema } from '../system/schemas/migration-status.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: MigrationStatus.name, schema: MigrationStatusSchema }]),
  ],
  controllers: [],
  providers: [],
})
export class MigrationModule {}
