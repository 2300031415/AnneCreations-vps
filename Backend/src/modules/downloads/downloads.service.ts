import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class DownloadsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) { }

  async verifyPurchase(customerId: string, productId: string, optionId: string) {
    if (!Types.ObjectId.isValid(productId) || !Types.ObjectId.isValid(optionId)) {
      throw new BadRequestException('Invalid product or option ID');
    }

    const order = await this.orderModel.findOne({
      customer: new Types.ObjectId(customerId),
      orderStatus: 'paid',
      'products.product': new Types.ObjectId(productId),
      'products.options.option': new Types.ObjectId(optionId)
    } as any).lean();

    if (!order) throw new ForbiddenException('You must purchase this product to download files');

    // Check expiry
    const orderDate = new Date(order.createdAt);
    const cutoffDate = new Date('2026-06-21T23:59:59.999Z');

    let expiryDate: Date;
    if ((order as any).expiryDate) {
      expiryDate = new Date((order as any).expiryDate);
    } else if (orderDate <= cutoffDate) {
      // For past orders created up to 21-06-2026: Grant 3 extra months from today for downloads
      expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 3);
    } else {
      // For orders created after 21-06-2026 & new daily customers: Default 3 months limit
      expiryDate = new Date(orderDate);
      expiryDate.setMonth(expiryDate.getMonth() + 3);
    }

    if (new Date() > expiryDate) {
      throw new ForbiddenException('Download link has expired');
    }

    return true;
  }

  async getDownloadPath(productId: string, optionId: string) {
    const product = await this.productModel.findById(productId).lean();
    if (!product) throw new NotFoundException('Product not found');

    const productOption = product.options?.find((o: any) =>
      o.option.toString() === optionId || o.option._id?.toString() === optionId
    );

    if (!productOption || !productOption.uploadedFilePath) {
      throw new NotFoundException('No downloadable file found for this option');
    }

    const fullPath = path.join(process.cwd(), productOption.uploadedFilePath);
    if (!fs.existsSync(fullPath)) throw new NotFoundException('File not found on server');

    // Increment download count
    await this.productModel.updateOne(
      { _id: new Types.ObjectId(productId), 'options.option': new Types.ObjectId(optionId) } as any,
      { $inc: { 'options.$.downloadCount': 1 } }
    );

    return {
      fullPath,
      fileName: path.basename(productOption.uploadedFilePath),
      mimeType: (productOption as any).mimeType || 'application/octet-stream'
    };
  }
}
