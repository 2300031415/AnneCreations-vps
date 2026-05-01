import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Admin, AdminDocument } from '../schemas/admin.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminsService {
  constructor(
    @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
  ) {}

  async findAll(query: any) {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
    const skip = (page - 1) * limit;

    const filters: any = {};
    if (query.search) {
        filters.$or = [
            { firstName: new RegExp(query.search, 'i') },
            { lastName: new RegExp(query.search, 'i') },
            { username: new RegExp(query.search, 'i') },
            { email: new RegExp(query.search, 'i') },
        ];
    }

    const admins = await this.adminModel.find(filters)
      .select('-password -salt')
      .populate('role', 'name description')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await this.adminModel.countDocuments(filters);

    return {
      data: admins,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    };
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid admin ID');
    const admin = await this.adminModel.findById(id).select('-password -salt').populate('role').lean();
    if (!admin) throw new NotFoundException('Admin not found');
    return admin;
  }

  async create(adminData: any) {
    const exists = await this.adminModel.findOne({ 
      $or: [{ username: adminData.username }, { email: adminData.email }] 
    } as any);
    if (exists) throw new ConflictException('Username or Email already registered');

    // Hash password
    if (adminData.password) {
      const salt = await bcrypt.genSalt(12);
      adminData.salt = salt;
      adminData.password = await bcrypt.hash(adminData.password, salt);
    }

    const admin = new this.adminModel({
      ...adminData,
      createdAt: new Date()
    });
    return await admin.save();
  }

  async update(id: string, updateData: any) {
    if (updateData.password) {
      const salt = await bcrypt.genSalt(12);
      updateData.salt = salt;
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }

    const admin = await this.adminModel.findByIdAndUpdate(id, updateData, { new: true }).select('-password -salt');
    if (!admin) throw new NotFoundException('Admin not found');
    return admin;
  }

  async remove(id: string) {
    const admin = await this.adminModel.findByIdAndDelete(id);
    if (!admin) throw new NotFoundException('Admin not found');
    return admin;
  }

  async findByUsernameOrEmail(identifier: string) {
    return await this.adminModel.findOne({
      $or: [
        { username: identifier },
        { email: identifier.toLowerCase() }
      ]
    }).select('+password +salt').populate('role').lean();
  }
}
