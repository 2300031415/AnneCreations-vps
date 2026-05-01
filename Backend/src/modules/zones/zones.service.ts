import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Zone, ZoneDocument } from './schemas/zone.schema';
import { Country, CountryDocument } from '../countries/schemas/country.schema';

@Injectable()
export class ZonesService {
  constructor(
    @InjectModel(Zone.name) private zoneModel: Model<ZoneDocument>,
    @InjectModel(Country.name) private countryModel: Model<CountryDocument>,
  ) {}

  async findAll(query: any) {
    const filters: any = {};
    if (query.status !== undefined) filters.status = query.status === 'true';
    if (query.search) {
        filters.$or = [
            { name: new RegExp(query.search, 'i') },
            { code: new RegExp(query.search, 'i') },
        ];
    }
    if (query.countryId) filters.country = new Types.ObjectId(query.countryId);

    return await this.zoneModel.find(filters).populate('country').sort({ name: 1 }).lean();
  }

  async findByCountry(countryId: string) {
    if (!Types.ObjectId.isValid(countryId)) throw new BadRequestException('Invalid country ID');
    return await this.zoneModel.find({ country: new Types.ObjectId(countryId) }).sort({ name: 1 }).lean();
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid zone ID');
    const zone = await this.zoneModel.findById(id).populate('country').lean();
    if (!zone) throw new NotFoundException('Zone not found');
    return zone;
  }

  async create(zoneData: any) {
    if (!Types.ObjectId.isValid(zoneData.countryId)) throw new BadRequestException('Invalid country ID');
    
    const country = await this.countryModel.findById(zoneData.countryId);
    if (!country) throw new NotFoundException('Country not found');

    const zone = new this.zoneModel({
      ...zoneData,
      country: new Types.ObjectId(zoneData.countryId),
      code: zoneData.code.toUpperCase()
    });
    return await zone.save();
  }

  async update(id: string, updateData: any) {
    if (updateData.countryId) {
        if (!Types.ObjectId.isValid(updateData.countryId)) throw new BadRequestException('Invalid country ID');
        const country = await this.countryModel.findById(updateData.countryId);
        if (!country) throw new NotFoundException('Country not found');
        updateData.country = new Types.ObjectId(updateData.countryId);
    }
    if (updateData.code) updateData.code = updateData.code.toUpperCase();

    const zone = await this.zoneModel.findByIdAndUpdate(id, updateData, { new: true });
    if (!zone) throw new NotFoundException('Zone not found');
    return zone;
  }

  async remove(id: string) {
    const zone = await this.zoneModel.findByIdAndDelete(id);
    if (!zone) throw new NotFoundException('Zone not found');
    return zone;
  }
}
