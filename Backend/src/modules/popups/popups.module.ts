import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PopupsService } from './popups.service';
import { PopupsController } from './popups.controller';
import { Popup, PopupSchema } from './schemas/popup.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Popup.name, schema: PopupSchema }]),
  ],
  controllers: [PopupsController],
  providers: [PopupsService],
  exports: [PopupsService, MongooseModule],
})
export class PopupsModule {}
