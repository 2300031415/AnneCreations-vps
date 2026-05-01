import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Customer, CustomerDocument } from '../schemas/customer.schema';
import { Order, OrderDocument } from '../../orders/schemas/order.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CustomersService {
  constructor(
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  async findAll(query: any) {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
    const skip = (page - 1) * limit;

    const filters: any = {};
    if (query.mobile) filters.mobile = new RegExp(query.mobile, 'i');
    if (query.email) filters.email = new RegExp(query.email, 'i');

    const customers = await this.customerModel.find(filters)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await this.customerModel.countDocuments(filters);

    // Attach order stats
    const customersWithStats = await Promise.all(customers.map(async (customer) => {
      const orderStats = await this.orderModel.aggregate([
        { $match: { customer: customer._id, orderStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$orderTotal' } } }
      ] as any);
      return {
        ...customer,
        totalOrderAmount: orderStats[0]?.total || 0
      };
    }));

    return {
      data: customersWithStats,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    };
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid customer ID');
    const customer = await this.customerModel.findById(id).lean();
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  async create(customerData: any) {
    const normalizedMobile = String(customerData.mobile || '').trim();
    const normalizedEmail = String(customerData.email || '').trim().toLowerCase();

    const existingMobile = normalizedMobile
      ? await this.customerModel.findOne({ mobile: normalizedMobile } as any)
      : null;
    if (existingMobile) throw new ConflictException('Mobile number already registered');

    const existingEmail = normalizedEmail
      ? await this.customerModel.findOne({ email: normalizedEmail } as any)
      : null;
    if (existingEmail) throw new ConflictException('Email already registered');

    // Hash password
    if (customerData.password) {
      const salt = await bcrypt.genSalt(10);
      customerData.salt = salt;
      customerData.password = await bcrypt.hash(customerData.password, salt);
    }

    const customer = new this.customerModel({
      ...customerData,
      mobile: normalizedMobile,
      email: normalizedEmail,
      dateAdded: new Date()
    });
    return await customer.save();
  }

  async update(id: string, updateData: any) {
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.salt = salt;
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }

    const customer = await this.customerModel.findByIdAndUpdate(id, updateData, { new: true });
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  async remove(id: string) {
    const customer = await this.customerModel.findByIdAndDelete(id);
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  async findByMobile(mobile: string) {
    return await this.customerModel.findOne({ mobile }).select('+password').lean();
  }

  async findByEmail(email: string) {
    return await this.customerModel.findOne({ email: email.toLowerCase() }).select('+password').lean();
  }

  async findByMobileOrEmail(identifier: string) {
    const normalized = identifier.trim();
    return await this.customerModel.findOne({
      $or: [
        { mobile: normalized },
        { email: normalized.toLowerCase() },
      ],
    } as any).select('+password').lean();
  }
}
