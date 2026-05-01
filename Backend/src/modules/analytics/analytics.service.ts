import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { OnlineUser, OnlineUserDocument } from '../users/schemas/online-user.schema';
import { UserActivity, UserActivityDocument } from '../users/schemas/user-activity.schema';
import { SearchLog, SearchLogDocument } from '../search/schemas/search-log.schema';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { Customer, CustomerDocument } from '../users/schemas/customer.schema';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(OnlineUser.name) private onlineUserModel: Model<OnlineUserDocument>,
    @InjectModel(UserActivity.name) private userActivityModel: Model<UserActivityDocument>,
    @InjectModel(SearchLog.name) private searchLogModel: Model<SearchLogDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
  ) {}

  async getOnlineUsers() {
    const activeThreshold = new Date(Date.now() - 5 * 60 * 1000);
    const users = await this.onlineUserModel.find({ lastActivity: { $gte: activeThreshold } } as any)
      .populate('customer', 'firstName lastName email')
      .sort({ lastActivity: -1 })
      .lean();

    const stats = {
      total: await this.onlineUserModel.countDocuments({ lastActivity: { $gte: activeThreshold } } as any),
      customers: await this.onlineUserModel.countDocuments({ userType: 'customer', lastActivity: { $gte: activeThreshold } } as any),
      guests: await this.onlineUserModel.countDocuments({ userType: 'guest', lastActivity: { $gte: activeThreshold } } as any),
    };

    return { users, stats };
  }

  async getSystemOverview() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [totalProducts, totalCustomers, totalOrders, totalSearches] = await Promise.all([
      this.productModel.countDocuments(),
      this.customerModel.countDocuments(),
      this.orderModel.countDocuments(),
      this.searchLogModel.countDocuments({ createdAt: { $gte: thirtyDaysAgo } } as any),
    ]);

    const productViews = await this.userActivityModel.aggregate([
      { $match: { action: 'view_product', createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: '$productId', views: { $sum: 1 } } },
      { $sort: { views: -1 } },
      { $limit: 5 }
    ] as any);

    return {
      totals: { products: totalProducts, customers: totalCustomers, orders: totalOrders, searches30d: totalSearches },
      topProducts: productViews
    };
  }

  async logActivity(data: any) {
    const activity = new this.userActivityModel({
        ...data,
        createdAt: new Date()
    });
    return await activity.save();
  }
}
