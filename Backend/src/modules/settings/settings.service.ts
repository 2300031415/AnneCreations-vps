import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Setting, SettingDocument } from './schemas/setting.schema';

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(Setting.name) private settingModel: Model<SettingDocument>,
  ) {}

  async findAll() {
    return await this.settingModel.find({}).lean();
  }

  async findByKey(key: string) {
    const setting = await this.settingModel.findOne({ key }).lean();
    if (!setting) throw new NotFoundException(`Setting with key ${key} not found`);
    return setting;
  }

  async updateByKey(key: string, value: any, description?: string) {
    return await this.settingModel.findOneAndUpdate(
      { key },
      { value, description },
      { new: true, upsert: true }
    ).lean();
  }

  async getPublicSettings() {
    const publicKeys = ['announcement_text', 'scrolling_message'];
    const settings = await this.settingModel.find({ key: { $in: publicKeys } }).lean();

    return settings.reduce((acc: any, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
  }
}
