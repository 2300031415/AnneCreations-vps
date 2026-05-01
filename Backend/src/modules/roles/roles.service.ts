import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Role, RoleDocument } from './schemas/role.schema';
import { Admin, AdminDocument } from '../users/schemas/admin.schema';
import { Feature } from './enums/role.enum';

@Injectable()
export class RolesService {
  constructor(
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
    @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
  ) {}

  async findAll(query: any) {
    const filters: any = {};
    if (query.status !== undefined) filters.status = query.status === 'true';
    if (query.search) {
      filters.name = { $regex: String(query.search).trim(), $options: 'i' };
    }

    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const [roles, total] = await Promise.all([
      this.roleModel.find(filters).sort({ name: 1 }).skip(skip).limit(limit).lean(),
      this.roleModel.countDocuments(filters),
    ]);

    return {
      roles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid role ID');
    const role = await this.roleModel.findById(id).lean();
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  async create(roleData: any) {
    const exists = await this.roleModel.findOne({ name: roleData.name });
    if (exists) throw new ConflictException('Role name already exists');

    const role = new this.roleModel(roleData);
    return await role.save();
  }

  async update(id: string, updateData: any) {
    const role = await this.roleModel.findByIdAndUpdate(id, updateData, { new: true });
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  async remove(id: string) {
    const role = await this.roleModel.findByIdAndDelete(id);
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  async findByName(name: string) {
    return await this.roleModel.findOne({ name }).lean();
  }

  async getFeatures() {
    const readOnlyFeatures = new Set<Feature>([
      Feature.DASHBOARD,
      Feature.ANALYTICS,
      Feature.LOGIN_AS_USER,
    ]);

    return Object.values(Feature).map((feature) => ({
      feature,
      name: feature,
      description: `Manage ${feature}`,
      allowedActions: readOnlyFeatures.has(feature)
        ? ['read']
        : ['create', 'read', 'update', 'delete'],
    }));
  }

  async getRoleAdmins(roleId: string) {
    if (!Types.ObjectId.isValid(roleId)) throw new BadRequestException('Invalid role ID');
    const admins = await this.adminModel
      .find({ role: new Types.ObjectId(roleId) } as any)
      .select('username email firstName lastName status')
      .sort({ username: 1 })
      .lean();

    return admins;
  }
}
