import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Country, CountryDocument } from './schemas/country.schema';

@Injectable()
export class CountriesService {
  constructor(
    @InjectModel(Country.name) private countryModel: Model<CountryDocument>,
  ) {}

  async findAll(query: any) {
    const filters: any = {};
    if (query.status !== undefined) filters.status = query.status === 'true';
    if (query.search) {
        filters.$or = [
            { name: new RegExp(query.search, 'i') },
            { isoCode2: new RegExp(query.search, 'i') },
            { isoCode3: new RegExp(query.search, 'i') },
        ];
    }

    return await this.countryModel.find(filters).sort({ name: 1 }).lean();
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid country ID');
    const country = await this.countryModel.findById(id).lean();
    if (!country) throw new NotFoundException('Country not found');
    return country;
  }

  async create(countryData: any) {
    const exists = await this.countryModel.findOne({ isoCode2: countryData.isoCode2.toUpperCase() });
    if (exists) throw new ConflictException('ISO Code 2 already exists');

    const country = new this.countryModel({
      ...countryData,
      isoCode2: countryData.isoCode2.toUpperCase(),
      isoCode3: countryData.isoCode3?.toUpperCase()
    });
    return await country.save();
  }

  async update(id: string, updateData: any) {
    if (updateData.isoCode2) updateData.isoCode2 = updateData.isoCode2.toUpperCase();
    if (updateData.isoCode3) updateData.isoCode3 = updateData.isoCode3.toUpperCase();

    const country = await this.countryModel.findByIdAndUpdate(id, updateData, { new: true });
    if (!country) throw new NotFoundException('Country not found');
    return country;
  }

  async remove(id: string) {
    const country = await this.countryModel.findByIdAndDelete(id);
    if (!country) throw new NotFoundException('Country not found');
    return country;
  }
}
