import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { DownloadsService } from '../downloads/downloads.service';

@Injectable()
export class AiService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private configService: ConfigService,
    private downloadsService: DownloadsService,
  ) { }

  async chat(message: string) {
    const lowerMsg = message.toLowerCase();

    if (lowerMsg.includes('download') || lowerMsg.includes('cannot') || lowerMsg.includes('failed') || lowerMsg.includes('receipt') || lowerMsg.includes('paid')) {
      return {
        reply: "I can help you resolve download issues. Please provide your Transaction ID (from your email/bank) and the Product Name.",
        type: 'request_info',
        fields: ['orderId', 'productId']
      };
    }

    if (lowerMsg.includes('search') || lowerMsg.includes('find') || lowerMsg.includes('design') || lowerMsg.includes('looking for')) {
      const keyword = lowerMsg.replace(/search|find|design|looking for|show me/g, '').trim();
      const products = await this.productModel.find({
        $or: [
          { productModel: { $regex: keyword, $options: 'i' } },
          { description: { $regex: keyword, $options: 'i' } }
        ],
        status: true
      }).select('productModel image options.price').limit(5).lean();

      if (products.length > 0) {
        return {
          reply: `I found ${products.length} designs matching "${keyword}":`,
          type: 'products',
          data: products
        };
      }
      return { reply: `I couldn't find any designs for "${keyword}". Try checking our Categories!` };
    }

    return {
      reply: "Hello! I am the Anne Creations AI Assistant. I can help you find designs or resolve download issues. How can I help?",
      quickReplies: [
        { label: "I cannot download my purchase", value: "I cannot download my purchase" },
        { label: "I want to find a design", value: "I want to find a design" }
      ]
    };
  }

  async verifyAndLink(orderId: string, productId: string) {
    let order;
    if (Types.ObjectId.isValid(orderId)) {
      order = await this.orderModel.findOne({ _id: orderId, orderStatus: 'paid' } as any).lean();
    }
    if (!order) {
      order = await this.orderModel.findOne({ orderNumber: orderId, orderStatus: 'paid' } as any).lean();
    }

    if (!order) throw new NotFoundException('Order not found or not paid');

    const fullOrder = await this.orderModel.findById(order._id).populate('products.product').lean();
    if (!fullOrder) throw new NotFoundException('Order not found');

    const targetProduct = fullOrder.products.find((p: any) =>
      p.product._id.toString() === productId ||
      p.product.productModel.toLowerCase().includes(productId.toLowerCase())
    );

    if (!targetProduct) throw new NotFoundException('Product not found in order');

    const token = jwt.sign(
      { orderId: order._id, productId: (targetProduct.product as any)._id || targetProduct.product },
      this.configService.get('JWT_SECRET') || 'secret',
      { expiresIn: '1h' }
    );

    return {
      success: true,
      link: `/api/ai/download/${token}`
    };
  }

  async resolveDownloadToken(token: string) {
    const payload = jwt.verify(
      token,
      this.configService.get('JWT_SECRET') || 'secret',
    ) as { orderId: string; productId: string };

    const order = await this.orderModel.findById(payload.orderId).populate('products.product').populate('products.options.option', 'name').lean();
    if (!order || order.orderStatus !== 'paid') {
      throw new NotFoundException('Order not found or not paid');
    }

    const productEntry = order.products.find(
      (item: any) =>
        String((item.product as any)?._id || item.product) === payload.productId,
    );

    if (!productEntry || !productEntry.options?.length) {
      throw new NotFoundException('No downloadable file found for this product');
    }

    const firstOption = productEntry.options[0] as any;
    const optionRef = firstOption.option as any;
    const optionId = String(optionRef?._id || optionRef);
    await this.downloadsService.verifyPurchase(String(order.customer), payload.productId, optionId);
    const file = await this.downloadsService.getDownloadPath(payload.productId, optionId);

    return {
      file,
      productName: (productEntry.product as any)?.productModel || 'design',
      optionName: optionRef?.name || 'file',
    };
  }
}
