import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Wallet, WalletDocument, WalletTransaction, WalletTransactionDocument } from './schemas/wallet.schema';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { Cart, CartDocument } from '../cart/schemas/cart.schema';
import { createRazorpayOrder, verifyPaymentSignature } from '../../common/utils/razorpay.utils';
import { buildDownloadManifest, buildReceiptPayload, sendOrderFulfillmentEmail } from '../orders/order-fulfillment.util';
import { Customer, CustomerDocument } from '../users/schemas/customer.schema';

@Injectable()
export class WalletService {
  constructor(
    @InjectModel(Wallet.name) private walletModel: Model<WalletDocument>,
    @InjectModel(WalletTransaction.name) private walletTransactionModel: Model<WalletTransactionDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
  ) {}

  async getWallet(customerId: string) {
    let wallet = await this.walletModel.findOne({ user: new Types.ObjectId(customerId) } as any);
    if (!wallet) {
      wallet = new this.walletModel({ user: new Types.ObjectId(customerId), balance: 0 });
      await wallet.save();
    }

    const transactions = await this.walletTransactionModel.find({ user: new Types.ObjectId(customerId) } as any)
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return {
      balance: wallet.balance,
      currency: wallet.currency,
      transactions
    };
  }

  async addMoney(customerId: string, amount: number, referenceId: string, description?: string) {
    if (amount <= 0) throw new BadRequestException('Invalid amount');

    let wallet = await this.walletModel.findOneAndUpdate(
      { user: new Types.ObjectId(customerId) } as any,
      { $inc: { balance: amount } },
      { new: true, upsert: true }
    );

    const transaction = new this.walletTransactionModel({
      wallet: wallet._id,
      user: new Types.ObjectId(customerId),
      amount,
      type: 'CREDIT',
      description: description || 'Added money to wallet',
      referenceId,
      status: 'COMPLETED'
    });

    await transaction.save();

    return { success: true, balance: wallet.balance };
  }

  async createAddMoneyOrder(customerId: string, amount: number) {
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new BadRequestException('Invalid amount');
    }

    const wallet = await this.getWallet(customerId);
    const receipt = `wallet_${String(customerId).slice(-8)}_${Date.now().toString().slice(-10)}`;
    let razorpayOrder;
    try {
      razorpayOrder = await createRazorpayOrder(
        amount, 
        wallet.currency || 'INR', 
        receipt,
        { customerId: String(customerId), type: 'wallet_topup' }
      );
    } catch (error: any) {
      throw new BadRequestException(error?.message || 'Unable to create Razorpay wallet order');
    }

    return {
      key: process.env.RAZORPAY_KEY_ID,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      orderId: razorpayOrder.id,
      receipt: razorpayOrder.receipt,
    };
  }

  async verifyAddMoney(
    customerId: string,
    payload: {
      razorpayPaymentId: string;
      razorpayOrderId: string;
      razorpaySignature: string;
      amount: number;
    },
  ) {
    const { razorpayPaymentId, razorpayOrderId, razorpaySignature, amount } = payload;

    if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
      throw new BadRequestException('Missing payment verification details');
    }

    const isValid = verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
    if (!isValid) {
      throw new BadRequestException('Invalid payment signature');
    }

    // Check if this payment was already processed (to avoid double credit)
    const existing = await this.walletTransactionModel.findOne({ referenceId: razorpayPaymentId });
    if (existing) {
      return { success: true, message: 'Payment already processed' };
    }

    return this.addMoney(customerId, Number(amount), razorpayPaymentId, 'Added money to wallet');
  }

  async handleRazorpayWebhook(razorpayOrderId: string, razorpayPaymentId: string, amount: number, notes: any) {
    const customerId = notes?.customerId;
    if (!customerId) {
      console.warn(`[Wallet Webhook] No customerId found in notes for order ${razorpayOrderId}`);
      return { success: false, message: 'No customerId in notes' };
    }

    // Check if already processed
    const existing = await this.walletTransactionModel.findOne({ referenceId: razorpayPaymentId });
    if (existing) {
      return { success: true, message: 'Payment already processed' };
    }

    console.log(`[Wallet Webhook] Crediting ₹${amount} to customer ${customerId} for payment ${razorpayPaymentId}`);
    return this.addMoney(customerId, amount, razorpayPaymentId, 'Added money to wallet (via Webhook)');
  }

  async payWithWallet(customerId: string, orderId: string) {
    const order = await this.orderModel.findOne({ _id: orderId, customer: new Types.ObjectId(customerId) } as any);
    if (!order) throw new NotFoundException('Order not found');
    if (order.orderStatus !== 'pending') throw new BadRequestException('Order already processed');

    const wallet = await this.walletModel.findOne({ user: new Types.ObjectId(customerId) } as any);
    if (!wallet || wallet.balance < order.orderTotal) throw new BadRequestException('Insufficient wallet balance');

    // Atomic deduction and order update logic (simplified here)
    wallet.balance -= order.orderTotal;
    await wallet.save();

    const transaction = new this.walletTransactionModel({
      wallet: wallet._id,
      user: new Types.ObjectId(customerId),
      amount: order.orderTotal,
      type: 'DEBIT',
      description: `Payment for Order #${order.orderNumber}`,
      referenceId: orderId,
      status: 'COMPLETED'
    });
    await transaction.save();

    order.orderStatus = 'paid';
    order.paymentMethod = 'Wallet';
    order.paymentCode = 'wallet';
    order.history.push({
      orderStatus: 'paid',
      comment: 'Payment completed using Wallet balance',
      notify: true,
      createdAt: new Date()
    } as any);
    await order.save();

    // Clear cart
    await this.cartModel.findOneAndUpdate({ customerId: new Types.ObjectId(customerId) } as any, { $set: { items: [] } });

    return await this.buildPostPaymentData(customerId, String(order._id));
  }

  async updateBalanceAdmin(customerId: string, amount: number, type: 'CREDIT' | 'DEBIT', description?: string) {
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new BadRequestException('Invalid amount');
    }

    const wallet = await this.walletModel.findOneAndUpdate(
      { user: new Types.ObjectId(customerId) } as any,
      { $inc: { balance: type === 'CREDIT' ? amount : -amount } },
      { new: true, upsert: true }
    );

    const transaction = new this.walletTransactionModel({
      wallet: wallet._id,
      user: new Types.ObjectId(customerId),
      amount,
      type,
      description,
      status: 'COMPLETED'
    });

    await transaction.save();
    return { wallet, transaction };
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
