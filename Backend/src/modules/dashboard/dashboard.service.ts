import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Customer, CustomerDocument } from '../users/schemas/customer.schema';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { OnlineUser, OnlineUserDocument } from '../users/schemas/online-user.schema';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(OnlineUser.name) private onlineUserModel: Model<OnlineUserDocument>,
  ) {}

  async getSalesRevenue(days?: number) {
    const filters: any = { orderStatus: 'paid' };
    if (days) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      filters.createdAt = { $gte: startDate };
    }

    const result = await this.orderModel.aggregate([
      { $match: filters },
      { $group: { _id: null, totalSales: { $sum: 1 }, totalRevenue: { $sum: '$orderTotal' } } }
    ]);

    return {
      totalSales: result.length > 0 ? result[0].totalSales : 0,
      totalRevenue: result.length > 0 ? result[0].totalRevenue : 0
    };
  }

  async getRecentOrders(limit: number = 10) {
    return await this.orderModel.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('customer', 'firstName lastName email')
      .lean();
  }

  async getOnlineStats() {
    const activeThreshold = new Date(Date.now() - 5 * 60 * 1000);
    return {
        totalOnline: await this.onlineUserModel.countDocuments({ lastActivity: { $gte: activeThreshold } } as any)
    };
  }

  async getNewOrders(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const orders = await this.orderModel.find({ createdAt: { $gte: startDate } } as any)
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('customer', 'firstName lastName email mobile')
      .lean();

    return {
      totalOrders: await this.orderModel.countDocuments({ createdAt: { $gte: startDate } } as any),
      period: `${days} days`,
      start_date: startDate.toISOString(),
      end_date: new Date().toISOString(),
      orders: orders.map((order: any) => ({
        orderId: String(order._id),
        orderNumber: order.orderNumber,
        customer: `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.trim(),
        total: order.orderTotal,
        status: order.orderStatus,
        razorpayOrderId: order.razorpayOrderId || null,
        createdAt: order.createdAt,
      })),
    };
  }

  async getNewCustomers(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const customers = await this.customerModel.find({ createdAt: { $gte: startDate } } as any)
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return {
      period: `${days} days`,
      startDate: startDate.toISOString(),
      endDate: new Date().toISOString(),
      totalNewCustomers: await this.customerModel.countDocuments({ createdAt: { $gte: startDate } } as any),
      totalCustomers: await this.customerModel.countDocuments(),
      customers: customers.map((customer: any) => ({
        customerId: String(customer._id),
        name: `${customer.firstName || ''} ${customer.lastName || ''}`.trim(),
        email: customer.email,
        createdAt: customer.createdAt,
      })),
    };
  }

  async getOnlineCustomers() {
    const activeThreshold = new Date(Date.now() - 5 * 60 * 1000);
    const users = await this.onlineUserModel.find({ lastActivity: { $gte: activeThreshold } } as any)
      .populate('customer', 'firstName lastName email')
      .lean();

    return {
      totalOnline: users.length,
      customers: users.map((item: any) => ({
        customer_id: item.customer?._id || item._id,
        name: `${item.customer?.firstName || ''} ${item.customer?.lastName || ''}`.trim(),
        email: item.customer?.email || '',
        last_active: item.lastActivity,
      })),
    };
  }

  async getYearlyRevenue(year: number) {
    const startDate = new Date(Date.UTC(year, 0, 1));
    const endDate = new Date(Date.UTC(year + 1, 0, 1));
    const rows = await this.orderModel.aggregate([
      { $match: { orderStatus: 'paid', createdAt: { $gte: startDate, $lt: endDate } } },
      {
        $group: {
          _id: { $month: '$createdAt' },
          revenue: { $sum: '$orderTotal' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ] as any);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return {
      year,
      totalRevenue: rows.reduce((sum: number, row: any) => sum + row.revenue, 0),
      totalOrders: rows.reduce((sum: number, row: any) => sum + row.orders, 0),
      monthlyData: rows.map((row: any) => ({
        month: row._id,
        month_name: monthNames[row._id - 1],
        revenue: row.revenue,
        orders: row.orders,
      })),
    };
  }

  async getYearlyNewCustomers(year: number) {
    const startDate = new Date(Date.UTC(year, 0, 1));
    const endDate = new Date(Date.UTC(year + 1, 0, 1));
    const rows = await this.customerModel.aggregate([
      { $match: { createdAt: { $gte: startDate, $lt: endDate } } },
      { $group: { _id: { $month: '$createdAt' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ] as any);

    return {
      year,
      totalNewCustomers: rows.reduce((sum: number, row: any) => sum + row.count, 0),
      monthlyData: rows.map((row: any) => ({
        month: row._id,
        count: row.count,
      })),
    };
  }

  async getTopProducts(days: number = 30, limit: number = 5) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const rows = await this.orderModel.aggregate([
      { $match: { orderStatus: 'paid', createdAt: { $gte: startDate } } },
      { $unwind: '$products' },
      {
        $group: {
          _id: '$products.product',
          totalSold: { $sum: 1 },
          totalRevenue: { $sum: '$orderTotal' },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productInfo',
        },
      },
      { $unwind: { path: '$productInfo', preserveNullAndEmptyArrays: true } },
    ] as any);

    return {
      period: `${days} days`,
      start_date: startDate.toISOString(),
      end_date: new Date().toISOString(),
      topProducts: rows.map((row: any) => ({
        productId: row._id,
        name: row.productInfo?.productModel || '',
        sku: row.productInfo?.sku || '',
        image: row.productInfo?.image || '',
        totalSold: row.totalSold,
        totalRevenue: row.totalRevenue,
      })),
    };
  }
}
