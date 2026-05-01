import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Popup, PopupDocument } from './schemas/popup.schema';

@Injectable()
export class PopupsService {
  constructor(
    @InjectModel(Popup.name) private popupModel: Model<PopupDocument>,
  ) {}

  async findActive(deviceType: string = 'all') {
    const filters: any = { status: true };
    if (deviceType !== 'all') {
      filters.deviceType = { $in: [deviceType, 'all'] };
    }

    const popup = await this.popupModel.findOne(filters)
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean();

    return popup;
  }

  async findAll() {
    return await this.popupModel.find().sort({ sortOrder: 1, createdAt: -1 }).lean();
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid popup ID');
    const popup = await this.popupModel.findById(id).lean();
    if (!popup) throw new NotFoundException('Popup not found');
    return popup;
  }

  async create(popupData: any) {
    const popup = new this.popupModel(popupData);
    return await popup.save();
  }

  async update(id: string, updateData: any) {
    const popup = await this.popupModel.findByIdAndUpdate(id, updateData, { new: true });
    if (!popup) throw new NotFoundException('Popup not found');
    return popup;
  }

  async remove(id: string) {
    const popup = await this.popupModel.findByIdAndDelete(id);
    if (!popup) throw new NotFoundException('Popup not found');
    return popup;
  }

  async toggleStatus(id: string) {
    const popup = await this.popupModel.findById(id);
    if (!popup) throw new NotFoundException('Popup not found');
    popup.status = !popup.status;
    return await popup.save();
  }
}
