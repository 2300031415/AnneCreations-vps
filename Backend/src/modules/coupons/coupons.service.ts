import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Coupon, CouponDocument } from './schemas/coupon.schema';
import { CouponUsage, CouponUsageDocument } from './schemas/coupon-usage.schema';
import { Order, OrderDocument } from '../orders/schemas/order.schema';

@Injectable()
export class CouponsService {
  constructor(
    @InjectModel(Coupon.name) private couponModel: Model<CouponDocument>,
    @InjectModel(CouponUsage.name) private couponUsageModel: Model<CouponUsageDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  async findAll(query: any) {
    const filters: any = {};
    if (query.status !== undefined) filters.status = query.status === 'true';

    return await this.couponModel.find(filters).sort({ createdAt: -1 }).lean();
  }

  async findOne(id: string) {
    const coupon = await this.couponModel.findById(id).lean();
    if (!coupon) throw new NotFoundException('Coupon not found');
    return coupon;
  }

  async findByCode(code: string, customerId?: string) {
    const now = new Date();
    const coupon = await this.couponModel.findOne({
      code: code.toUpperCase(),
      status: true,
      $and: [
        { $or: [{ dateStart: { $lte: now } }, { dateStart: null }] },
        { $or: [{ dateEnd: { $gte: now } }, { dateEnd: null }] },
      ],
    } as any).lean();

    if (!coupon) throw new NotFoundException('Coupon not found or expired');
    return coupon;
  }

  async findActiveCoupons() {
    const now = new Date();
    const coupons = await this.couponModel.find({
      status: true,
      $and: [
        { $or: [{ dateStart: { $lte: now } }, { dateStart: null }] },
        { $or: [{ dateEnd: { $gte: now } }, { dateEnd: null }] },
      ],
    } as any)
      .sort({ createdAt: -1 })
      .lean();

    return coupons;
  }

  async findPublicActiveCoupon() {
    const now = new Date();
    const coupon = await this.couponModel.findOne({
      status: true,
      $and: [
        { $or: [{ dateStart: { $lte: now } }, { dateStart: null }] },
        { $or: [{ dateEnd: { $gte: now } }, { dateEnd: null }] },
      ],
    } as any)
      .sort({ autoApply: -1, createdAt: -1 })
      .lean();

    return coupon;
  }

  async validateAndApply(code: string, orderId: string, customerId: string) {
    const coupon = await this.findByCode(code, customerId);
    const order = await this.orderModel.findById(orderId);
    
    if (!order) throw new NotFoundException('Order not found');
    if (order.customer.toString() !== customerId) throw new BadRequestException('Unauthorized');
    if (order.orderStatus !== 'pending') throw new BadRequestException('Coupon only for pending orders');
    if (order.coupon) throw new ConflictException('Coupon already applied');

    // Calculate subtotal
    const subtotal = order.orderTotal; 
    if (subtotal < coupon.minAmount) {
      throw new BadRequestException(`Minimum order amount of ${coupon.minAmount} required`);
    }

    // Check usage limits
    const usageCount = await this.couponUsageModel.countDocuments({ coupon: coupon._id } as any);
    if (coupon.totalUses > 0 && usageCount >= coupon.totalUses) {
      throw new BadRequestException('Coupon usage limit reached');
    }

    const customerUsageCount = await this.couponUsageModel.countDocuments({ 
      coupon: coupon._id, 
      customer: new Types.ObjectId(customerId) 
    } as any);
    if (coupon.customerUses > 0 && customerUsageCount >= coupon.customerUses) {
      throw new BadRequestException('You have reached the usage limit for this coupon');
    }

    // Calculate discount
    let discount = coupon.type === 'P' ? (subtotal * coupon.discount) / 100 : coupon.discount;
    if (coupon.maxDiscount > 0 && discount > coupon.maxDiscount) discount = coupon.maxDiscount;
    
    const discountAmount = Math.min(discount, subtotal);
    const finalTotal = subtotal - discountAmount;

    // Update order
    order.coupon = coupon._id as any;
    order.orderTotal = finalTotal;
    order.totals = [
        { code: 'subtotal', value: subtotal, sortOrder: 1 },
        { code: 'couponDiscount', value: discountAmount, sortOrder: 2 },
        { code: 'total', value: finalTotal, sortOrder: 3 }
    ] as any;

    await order.save();

    return {
      coupon: {
        _id: coupon._id,
        name: coupon.name,
        code: coupon.code,
        discount: discountAmount,
        type: coupon.type,
        minAmount: coupon.minAmount,
        maxDiscount: coupon.maxDiscount,
      },
      calculation: {
        originalAmount: subtotal,
        discountAmount,
        finalAmount: finalTotal,
      },
      finalTotal,
      applied: true,
      message: 'Coupon applied successfully',
    };
  }

  async create(couponData: any) {
    const exists = await this.couponModel.findOne({ code: couponData.code.toUpperCase() });
    if (exists) throw new ConflictException('Coupon code already exists');

    const coupon = new this.couponModel({
      ...couponData,
      code: couponData.code.toUpperCase()
    });
    return await coupon.save();
  }

  async update(id: string, couponData: any) {
    if (couponData.code) {
      const existing = await this.couponModel.findOne({
        code: couponData.code.toUpperCase(),
        _id: { $ne: new Types.ObjectId(id) },
      } as any);
      if (existing) throw new ConflictException('Coupon code already exists');
    }

    const coupon = await this.couponModel.findByIdAndUpdate(
      id,
      {
        ...couponData,
        ...(couponData.code ? { code: couponData.code.toUpperCase() } : {}),
      },
      { new: true },
    );

    if (!coupon) throw new NotFoundException('Coupon not found');
    return coupon;
  }

  async remove(id: string) {
    const coupon = await this.couponModel.findByIdAndDelete(id);
    if (!coupon) throw new NotFoundException('Coupon not found');
    return coupon;
  }

  async applyCouponToOrder(code: string, orderId: string, customerId: string) {
    return this.validateAndApply(code, orderId, customerId);
  }

  async removeCouponFromOrder(orderId: string, customerId: string) {
    const order = await this.orderModel.findById(orderId);
    if (!order) {
        throw new NotFoundException('Order not found');
    }
    if (order.customer.toString() !== customerId) {
        throw new BadRequestException('Unauthorized');
    }
    
    if (!order.coupon) {
        return { success: true, message: 'No coupon to remove' };
    }


    // Find the original subtotal
    const subtotalItem = order.totals.find((t: any) => t.code === 'subtotal');
    const originalSubtotal = subtotalItem ? subtotalItem.value : order.orderTotal;

    // Reset order
    order.coupon = null as any;
    order.orderTotal = originalSubtotal;
    order.totals = [
        { code: 'subtotal', value: originalSubtotal, sortOrder: 1 },
        { code: 'total', value: originalSubtotal, sortOrder: 2 }
    ] as any;

    await order.save();

    return {
        success: true,
        message: 'Coupon removed successfully',
        finalTotal: originalSubtotal
    };
  }

  async autoApplyCoupon(orderId: string, customerId: string) {
    const order = await this.orderModel.findById(orderId).lean();
    if (!order) throw new NotFoundException('Order not found');
    if (String(order.customer) !== customerId) throw new BadRequestException('Unauthorized');
    if (order.orderStatus !== 'pending') throw new BadRequestException('Coupon only for pending orders');
    if (order.coupon) {
      return {
        applied: true,
        coupon: { reason: 'Coupon already applied to this order' },
      };
    }

    const subtotal = order.totals?.find((item: any) => item.code === 'subtotal')?.value ?? order.orderTotal;
    const now = new Date();
    const coupons = await this.couponModel.find({
      autoApply: true,
      status: true,
      $and: [
        { $or: [{ dateStart: { $lte: now } }, { dateStart: null }] },
        { $or: [{ dateEnd: { $gte: now } }, { dateEnd: null }] },
      ],
    } as any).lean();

    const eligible = coupons
      .map((coupon: any) => {
        if (subtotal < (coupon.minAmount || 0)) return null;
        let discount = coupon.type === 'P' ? (subtotal * coupon.discount) / 100 : coupon.discount;
        if (coupon.maxDiscount > 0 && discount > coupon.maxDiscount) discount = coupon.maxDiscount;
        return { coupon, discountAmount: Math.min(discount, subtotal) };
      })
      .filter(Boolean)
      .sort((a: any, b: any) => b.discountAmount - a.discountAmount);

    if (eligible.length === 0) {
      return {
        applied: false,
        reason: 'No eligible auto coupon available for this order',
      };
    }

    const best = eligible[0] as { coupon: any; discountAmount: number };
    const result = await this.validateAndApply(best.coupon.code, orderId, customerId);
    return {
      ...result,
      reason: `Coupon "${best.coupon.code}" applied! You saved Rs.${best.discountAmount}`,
    };
  }
}
