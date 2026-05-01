import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart, CartDocument } from '../cart/schemas/cart.schema';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { Counter, CounterDocument } from '../../models/counter.model';
import { Coupon, CouponDocument } from '../coupons/schemas/coupon.schema';
import { CouponUsage, CouponUsageDocument } from '../coupons/schemas/coupon-usage.schema';
import { createRazorpayOrder, verifyPaymentSignature } from '../../common/utils/razorpay.utils';
import { buildDownloadManifest, buildReceiptPayload, sendOrderFulfillmentEmail } from '../orders/order-fulfillment.util';
import { Customer, CustomerDocument } from '../users/schemas/customer.schema';
import { SalesService } from '../sales/sales.service';

@Injectable()
export class CheckoutService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Counter.name) private counterModel: Model<CounterDocument>,
    @InjectModel(Coupon.name) private couponModel: Model<CouponDocument>,
    @InjectModel(CouponUsage.name) private couponUsageModel: Model<CouponUsageDocument>,
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
    private readonly salesService: SalesService,
  ) {}

  async startCheckout(customerId: string, addressData: any) {
    const cart = await this.cartModel.findOne({ customerId: new Types.ObjectId(customerId) } as any)
      .populate({
        path: 'items.product',
        populate: { path: 'categories' }
      })
      .lean();

    if (!cart || cart.items.length === 0) throw new BadRequestException('Cart is empty');

    // Recalculate everything for the final order
    let finalItems = [];
    let subtotal = 0;

    for (const item of cart.items) {
      if (!item.product) continue;
      
      let itemOptions = [];
      let itemSubtotal = 0;
      
      for (const opt of item.options) {
        const price = await this.salesService.getDiscountedPrice(item.product, opt);
        itemOptions.push({ ...opt, price }); // Save the actual paid price in order
        itemSubtotal += price;
      }
      
      finalItems.push({
        product: (item.product as any)._id,
        options: itemOptions,
        subtotal: itemSubtotal
      });
      subtotal += itemSubtotal;
    }

    // Get next order number
    const counter = await this.counterModel.findByIdAndUpdate(
      'orderNumber',
      { $inc: { sequence_value: 1 } },
      { new: true, upsert: true }
    );
    const orderNumber = counter.sequence_value.toString();

    const order = new this.orderModel({
      customer: new Types.ObjectId(customerId),
      orderNumber,
      products: finalItems,
      orderTotal: subtotal,
      totals: [
        { code: 'subtotal', value: subtotal, sortOrder: 1 },
        { code: 'total', value: subtotal, sortOrder: 2 }
      ],
      orderStatus: 'pending',
      paymentMethod: 'Razorpay',
      paymentCode: 'razorpay',
      ...addressData,
      history: [{
        orderStatus: 'pending',
        comment: 'Checkout initiated with active offers',
        createdAt: new Date()
      }]
    });

    return await order.save();
  }

  async getCheckoutStatus(customerId: string, orderId: string) {
    const order = await this.orderModel.findOne({
      _id: orderId,
      customer: new Types.ObjectId(customerId),
    } as any)
      .populate('products.product', 'productModel sku image price description')
      .populate('coupon', 'name code discount type minAmount maxDiscount')
      .lean();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const subtotal = order.totals?.find((item) => item.code === 'subtotal')?.value ?? order.orderTotal;
    const discount = order.totals?.find((item) => item.code === 'couponDiscount')?.value ?? 0;
    const total = order.totals?.find((item) => item.code === 'total')?.value ?? order.orderTotal;

    return {
      orderId: String(order._id),
      orderNumber: order.orderNumber,
      orderStatus: order.orderStatus,
      paymentMethod: order.paymentMethod,
      paymentCode: order.paymentCode,
      subtotal,
      discount,
      total,
      totalAmount: total,
      orderTotal: total,
      products: order.products,
      coupon: order.coupon || null,
      applied: Boolean(order.coupon),
      calculation: order.coupon
        ? {
            originalAmount: subtotal,
            discountAmount: discount,
            finalAmount: total,
          }
        : null,
      message: order.coupon ? 'Coupon applied successfully' : null,
    };
  }

  async cancelCheckout(customerId: string, orderId: string) {
    const order = await this.orderModel.findOne({
      _id: orderId,
      customer: new Types.ObjectId(customerId),
    } as any);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.orderStatus !== 'pending') {
      throw new ConflictException('Only pending orders can be cancelled');
    }

    order.orderStatus = 'cancelled';
    order.history.push({
      orderStatus: 'cancelled',
      comment: 'Checkout cancelled by customer',
      notify: false,
      createdAt: new Date(),
    } as any);

    await order.save();

    return { success: true, message: 'Checkout cancelled successfully' };
  }

  async createPaymentOrder(customerId: string, orderId: string) {
    const order = await this.orderModel.findOne({ _id: orderId, customer: new Types.ObjectId(customerId) } as any);
    if (!order) throw new NotFoundException('Order not found');
    if (order.orderStatus !== 'pending') throw new BadRequestException('Order status not pending');

    if (order.orderTotal <= 0) {
      order.orderStatus = 'paid';
      order.paymentMethod = 'Free';
      order.paymentCode = 'free';
      order.history.push({
        orderStatus: 'paid',
        comment: 'Order completed without payment because total amount is zero',
        notify: true,
        createdAt: new Date(),
      } as any);
      await order.save();
      await this.cartModel.findOneAndUpdate(
        { customerId: new Types.ObjectId(customerId) } as any,
        { $set: { items: [] } },
      );

      return {
        orderId: String(order._id),
        orderNumber: order.orderNumber,
        amount: 0,
        amountDisplay: 0,
        currency: 'INR',
        paymentRequired: false,
        completed: true,
        postPaymentData: await this.buildPostPaymentData(customerId, String(order._id)),
      };
    }

    let razorpayOrder;
    try {
      razorpayOrder = await createRazorpayOrder(order.orderTotal, 'INR', order.orderNumber);
    } catch (error: any) {
      throw new BadRequestException(error?.message || 'Unable to create Razorpay order');
    }
    
    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    return {
        key: process.env.RAZORPAY_KEY_ID,
        orderId: String(order._id),
        orderNumber: order.orderNumber,
        amount: razorpayOrder.amount,
        amountDisplay: order.orderTotal,
        currency: razorpayOrder.currency,
        razorpayOrderId: razorpayOrder.id,
        receipt: razorpayOrder.receipt,
        paymentRequired: order.orderTotal > 0
    };
  }

  async completeCheckout(customerId: string, paymentData: any) {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = paymentData;
    const order = await this.orderModel.findOne({ _id: orderId, customer: new Types.ObjectId(customerId) } as any);
    
    if (!order) throw new NotFoundException('Order not found');
    if (order.orderStatus !== 'pending') throw new BadRequestException('Order already processed');
    if (!order.razorpayOrderId) throw new BadRequestException('Payment order not initialized');
    if (razorpayOrderId && razorpayOrderId !== order.razorpayOrderId) {
      throw new BadRequestException('Payment order mismatch');
    }

    // Verify payment
    const isValid = verifyPaymentSignature(order.razorpayOrderId, razorpayPaymentId, razorpaySignature);
    if (!isValid) throw new BadRequestException('Invalid payment signature');

    order.orderStatus = 'paid';
    order.paymentMethod = 'Razorpay';
    order.paymentCode = 'razorpay';
    order.history.push({
      orderStatus: 'paid',
      comment: `Payment completed via Razorpay. ID: ${razorpayPaymentId}`,
      notify: true,
      createdAt: new Date()
    } as any);

    await order.save();

    // Clear cart
    await this.cartModel.findOneAndUpdate({ customerId: new Types.ObjectId(customerId) } as any, { $set: { items: [] } });

    return await this.buildPostPaymentData(customerId, String(order._id));
  }

  async retryPayment(customerId: string, orderId: string) {
    return this.createPaymentOrder(customerId, orderId);
  }

  private async buildPostPaymentData(customerId: string, orderId: string) {
    const order = await this.orderModel.findOne({
      _id: new Types.ObjectId(orderId),
      customer: new Types.ObjectId(customerId),
    } as any)
      .populate('customer', 'email firstName lastName')
      .populate('products.product', 'productModel image')
      .populate('products.options.option', 'name')
      .lean();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    let emailSent = false;
    try {
      emailSent = await sendOrderFulfillmentEmail(order);
    } catch (error: any) {
      console.error('[Fulfillment] Email sending failed:', error.message || error);
      emailSent = false;
    }

    return {
      success: true,
      orderId: String(order._id),
      orderNumber: order.orderNumber,
      totalAmount: order.orderTotal,
      paymentMethod: order.paymentMethod,
      emailSent,
      receipt: buildReceiptPayload(order),
      downloads: buildDownloadManifest(order),
    };
  }
}
