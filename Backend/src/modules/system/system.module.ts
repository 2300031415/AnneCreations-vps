import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SystemService } from './system.service';
import { SystemController } from './system.controller';
import { MigrationStatus, MigrationStatusSchema } from './schemas/migration-status.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: MigrationStatus.name, schema: MigrationStatusSchema }]),
  ],
  controllers: [SystemController],
  providers: [SystemService],
  exports: [SystemService],
})
export class SystemModule {}
