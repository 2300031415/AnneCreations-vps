import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { Customer, CustomerDocument } from '../users/schemas/customer.schema';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
  ) {}

  async findAll(query: any) {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
    const skip = (page - 1) * limit;

    const filters = await this.buildOrderFilters(query);

    const orders = await this.orderModel.find(filters)
      .populate('customer', 'firstName lastName email mobile')
      .populate('products.product', 'productModel sku image')
      .populate('products.options.option', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await this.orderModel.countDocuments(filters);

    return {
      data: orders.map((order) => this.mapOrderForFrontend(order)),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid order ID');

    const order = await this.orderModel.findById(id)
      .populate('customer', 'firstName lastName email mobile')
      .populate('products.product', 'productModel sku image')
      .populate('products.options.option', 'name')
      .lean();

    if (!order) throw new NotFoundException('Order not found');
    return this.mapOrderForFrontend(order);
  }

  async findByCustomer(customerId: string, query: any) {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
    const skip = (page - 1) * limit;
    const baseFilters = await this.buildOrderFilters(query);
    const filters: any = {
      ...baseFilters,
      customer: new Types.ObjectId(customerId),
    };

    const orders = await this.orderModel.find(filters)
      .populate('customer', 'firstName lastName email mobile')
      .populate('products.product', 'productModel sku image')
      .populate('products.options.option', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await this.orderModel.countDocuments(filters);

    return {
      data: orders.map((order) => this.mapOrderForFrontend(order)),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async updateStatus(id: string, status: string, comment?: string) {
    const validStatuses = ['pending', 'paid', 'cancelled', 'refunded', 'failed'];
    if (!validStatuses.includes(status)) throw new BadRequestException('Invalid status');

    const order = await this.orderModel.findById(id);
    if (!order) throw new NotFoundException('Order not found');

    const oldStatus = order.orderStatus;
    order.orderStatus = status;
    order.history.push({
      orderStatus: status,
      comment: comment || `Status updated from ${oldStatus} to ${status}`,
      notify: true,
      createdAt: new Date(),
    } as any);

    // If marked as paid, increment sales count for products
    if (status === 'paid' && oldStatus !== 'paid') {
      for (const item of order.products) {
        await this.productModel.findByIdAndUpdate(item.product, { $inc: { salesCount: 1 } });
      }
    }

    return await order.save();
  }

  async getAnalytics(startDate: Date, endDate: Date) {
    const totalOrders = await this.orderModel.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate },
    });

    const revenue = await this.orderModel.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate }, orderStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$orderTotal' } } },
    ]);

    return {
      totalOrders,
      totalRevenue: revenue[0]?.total || 0,
    };
  }

  private async buildOrderFilters(query: any) {
    const filters: any = {};
    if (query.status) {
      if (Array.isArray(query.status)) {
        filters.orderStatus = { $in: query.status };
      } else {
        filters.orderStatus = query.status;
      }
    }
    if (query.customer) {
      filters.customer = new Types.ObjectId(query.customer);
    }
    if (query.search) {
      const term = String(query.search).trim();
      const regex = { $regex: term, $options: 'i' };

      if (query.searchField && query.searchField !== 'all') {
        if (query.searchField === 'id') {
          filters.orderNumber = regex;
        } else if (query.searchField === 'razorpayOrderId') {
          filters.razorpayOrderId = regex;
        } else if (['customer', 'email', 'phone'].includes(query.searchField)) {
          const customerQuery: any = {};
          if (query.searchField === 'customer') {
            customerQuery.$or = [{ firstName: regex }, { lastName: regex }];
          } else if (query.searchField === 'email') {
            customerQuery.email = regex;
          } else if (query.searchField === 'phone') {
            customerQuery.mobile = regex;
          }
          const matchingCustomers = await this.customerModel.find(customerQuery, '_id').lean();
          filters.customer = { $in: matchingCustomers.map(c => c._id) };
        }
      } else {
        const matchingProducts = await this.productModel.find({
          $or: [{ productModel: regex }, { sku: regex }]
        }, '_id').lean();
        const productIds = matchingProducts.map(p => p._id);

        const matchingCustomers = await this.customerModel.find({
          $or: [{ firstName: regex }, { lastName: regex }, { email: regex }, { mobile: regex }]
        }, '_id').lean();
        const customerIds = matchingCustomers.map(c => c._id);

        filters.$or = [
          { orderNumber: regex },
          { razorpayOrderId: regex },
          { 'products.product': { $in: productIds } },
          { customer: { $in: customerIds } }
        ];
      }
    }
    return filters;
  }

  private mapOrderForFrontend(order: any) {
    if (!order) return null;
    try {
      const totalAmount = order.totals?.find((item: any) => item.code === 'total')?.value ?? order.orderTotal ?? 0;

      return {
        ...order,
        totalAmount,
        total: totalAmount,
        payment: {
          method: order.paymentMethod || order.paymentCode || 'N/A',
          code: order.paymentCode || null,
          firstName: order.paymentFirstName || '',
          lastName: order.paymentLastName || '',
          company: order.paymentCompany || '',
          address1: order.paymentAddress1 || '',
          address2: order.paymentAddress2 || '',
          city: order.paymentCity || '',
          postcode: order.paymentPostcode || '',
          country: order.paymentCountry || '',
          zone: order.paymentZone || '',
        },
        products: (order.products || []).map((productItem: any) => {
          if (!productItem) return null;
          return {
            ...productItem,
            product: productItem.product,
            options: (productItem.options || []).map((optionItem: any) => {
              if (!optionItem) return null;
              const rawOption = optionItem.option;
              const optionId =
                rawOption && typeof rawOption === 'object'
                  ? String(rawOption._id || rawOption.id || '')
                  : String(rawOption || '');
              const optionName =
                rawOption && typeof rawOption === 'object'
                  ? rawOption.name || rawOption.label || optionId || 'N/A'
                  : optionId || 'N/A';

              return {
                ...optionItem,
                option: {
                  _id: optionId,
                  name: optionName,
                },
              };
            }).filter(Boolean),
          };
        }).filter(Boolean),
      };
    } catch (e) {
      console.error('Error mapping order for frontend:', e, order?._id);
      return order; // Return raw order if mapping fails
    }
  }
}
