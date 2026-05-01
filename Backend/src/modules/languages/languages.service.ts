import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Language, LanguageDocument } from './schemas/language.schema';

@Injectable()
export class LanguagesService {
  constructor(
    @InjectModel(Language.name) private languageModel: Model<LanguageDocument>,
  ) {}

  async findAll(query: any) {
    const filters: any = {};
    if (query.status !== undefined) filters.status = query.status === 'true';

    return await this.languageModel.find(filters).sort({ sortOrder: 1 }).lean();
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid language ID');
    const language = await this.languageModel.findById(id).lean();
    if (!language) throw new NotFoundException('Language not found');
    return language;
  }

  async create(languageData: any) {
    const exists = await this.languageModel.findOne({ code: languageData.code.toLowerCase() });
    if (exists) throw new ConflictException('Language code already exists');

    const language = new this.languageModel({
      ...languageData,
      code: languageData.code.toLowerCase()
    });
    return await language.save();
  }

  async update(id: string, updateData: any) {
    if (updateData.code) updateData.code = updateData.code.toLowerCase();
    
    const language = await this.languageModel.findByIdAndUpdate(id, updateData, { new: true });
    if (!language) throw new NotFoundException('Language not found');
    return language;
  }

  async remove(id: string) {
    const language = await this.languageModel.findByIdAndDelete(id);
    if (!language) throw new NotFoundException('Language not found');
    return language;
  }

  async findDefault() {
    return await this.languageModel.findOne({ status: true }).sort({ sortOrder: 1 }).lean();
  }
}
