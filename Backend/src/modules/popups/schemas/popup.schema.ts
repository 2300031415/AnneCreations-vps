import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PopupDocument = Popup & Document;

@Schema({ _id: true })
export class PopupButton {
  @Prop({ required: true, trim: true })
  text: string;

  @Prop({ required: true, trim: true })
  action: string;

  @Prop({ enum: ['primary', 'secondary', 'outline', 'link'], default: 'primary' })
  style: string;

  @Prop({ trim: true })
  icon: string;
}
export const PopupButtonSchema = SchemaFactory.createForClass(PopupButton);

@Schema({ timestamps: true, collection: 'popups' })
export class Popup {
  @Prop({ required: true, trim: true, maxlength: 200 })
  title: string;

  @Prop({ required: true, trim: true })
  content: string;

  @Prop({ trim: true })
  image: string;

  @Prop({ type: [PopupButtonSchema], default: [] })
  buttons: PopupButton[];

  @Prop({ default: false })
  status: boolean;

  @Prop({ enum: ['once', 'always'], default: 'once' })
  displayFrequency: string;

  @Prop({ default: 0 })
  sortOrder: number;

  @Prop({ enum: ['all', 'mobile', 'desktop'], default: 'all' })
  deviceType: string;
}

export const PopupSchema = SchemaFactory.createForClass(Popup);

PopupSchema.index({ status: 1, sortOrder: 1 });
PopupSchema.index({ deviceType: 1 });
