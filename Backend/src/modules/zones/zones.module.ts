import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ZonesService } from './zones.service';
import { ZonesController } from './zones.controller';
import { Zone, ZoneSchema } from './schemas/zone.schema';
import { CountriesModule } from '../countries/countries.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Zone.name, schema: ZoneSchema }]),
    CountriesModule,
  ],
  controllers: [ZonesController],
  providers: [ZonesService],
  exports: [ZonesService, MongooseModule],
})
export class ZonesModule {}
