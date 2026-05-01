import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { Review, ReviewDocument } from '../reviews/schemas/review.schema';
import { Language, LanguageDocument } from '../languages/schemas/language.schema';
import { CreateProductDto } from './dto/create-product.dto';
import * as fs from 'fs';
import * as path from 'path';
import { generateProductPDF } from '../../utils/pdf-generator';
import { saveFile, deleteFile } from '../../utils/file.utils';
import { SalesService } from '../sales/sales.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    @InjectModel(Language.name) private languageModel: Model<LanguageDocument>,
    @InjectModel('ProductOption') private masterOptionModel: Model<any>,
    private readonly salesService: SalesService,
  ) { }

  async findAll(query: any, isAdmin: boolean = false) {
    let page = Math.max(1, parseInt(query.page) || 1);
    let limit = Math.min(10000, Math.max(1, parseInt(query.limit) || 20));
    let skip = (page - 1) * limit;

    const filters: any = {};
    if (!isAdmin) {
      filters.status = true;
    }

    if (query.status === 'true') filters.status = true;
    if (query.status === 'false') filters.status = false;

    // Search logic
    if (query.search || query.productModel || query.sku) {
      const search = query.search || query.productModel || query.sku;
      filters.$or = [
        { productModel: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { 'seo.metaTitle': { $regex: search, $options: 'i' } },
      ];
    }

    if (query.categoryId) {
      filters.categories = new Types.ObjectId(query.categoryId);
    } else if (query.categories) {
      const categoryIds = Array.isArray(query.categories) ? query.categories : [query.categories];
      filters.categories = { $in: categoryIds.map((id: string) => new Types.ObjectId(id)) };
    }

    // Handle special types (new, deals, best)
    const tab = query.tab || query.type;
    if (tab === 'new-releases' || tab === 'new') {
      // Show exactly the newest 24 products regardless of how old the catalog is
      limit = Math.min(limit, 24);
      skip = (page - 1) * limit; // Recalculate skip just in case
      // Sorting is handled slightly below, but we ensure descending is the default
    } else if (tab === 'todays-deals' || tab === 'deals') {
      filters.todayDeal = true;
    } else if (tab === 'free') {
      filters['options.price'] = 0;
    }

    const sortField = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 1 : -1;
    const sort = { [sortField]: sortOrder };

    const products = await this.productModel.find(filters)
      .populate('categories', 'name')
      .populate('languageId', 'name code')
      .populate('options.option', 'name sortOrder')
      .sort(sort as any)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await this.productModel.countDocuments(filters);

    // Patch specific products metadata if missing (as requested for specific products)
    const patchedProducts = products.map(p => {
      if (p.productModel === 'BHPALLU149') {
        return {
          ...p,
          stitches: p.stitches || '24,500',
          dimensions: p.dimensions || '250mm x 350mm',
          image: 'catalog/product/HBBH149_image.jpg'
        };
      }
      if (p.productModel === 'BHPALLU147') {
        return {
          ...p,
          stitches: p.stitches || '24,500',
          dimensions: p.dimensions || '250mm x 350mm',
          image: 'catalog/product/HBBH147_image.jpg'
        };

      }
      return p;
    });

    const productsWithStats = await this.attachReviewStats(patchedProducts);
    const finalProducts = await this.applyGlobalSales(productsWithStats);

    return {
      data: finalProducts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findByCategory(categoryId: string, query: any) {
    if (!Types.ObjectId.isValid(categoryId)) {
      throw new BadRequestException('Invalid category ID');
    }

    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(1000, Math.max(1, parseInt(query.limit) || 20));
    const skip = (page - 1) * limit;

    const filters: any = {
      status: true,
      categories: new Types.ObjectId(categoryId),
    };

    const sortMap: Record<string, any> = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      name_asc: { productModel: 1 },
      name_desc: { productModel: -1 },
      price_asc: { sortOrder: 1, createdAt: -1 },
      price_desc: { sortOrder: -1, createdAt: -1 },
    };

    const sort = sortMap[query.sort] || { createdAt: -1 };

    const products = await this.productModel.find(filters)
      .populate('categories', 'name')
      .populate('languageId', 'name code')
      .populate('options.option', 'name sortOrder')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await this.productModel.countDocuments(filters);
    const productsWithStats = await this.attachReviewStats(products);
    const finalProducts = await this.applyGlobalSales(productsWithStats);

    return {
      data: finalProducts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(identifier: string, isAdmin: boolean = false) {
    const filters: any = {};
    if (Types.ObjectId.isValid(identifier)) {
      filters._id = new Types.ObjectId(identifier);
    } else {
      filters.productModel = identifier;
    }

    if (!isAdmin) {
      filters.status = true;
    }

    const product = await this.productModel.findOne(filters)
      .populate('categories', 'name')
      .populate('languageId', 'name code')
      .populate('options.option', 'name sortOrder')
      .lean();

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Increment view count
    await this.productModel.findByIdAndUpdate(product._id, { $inc: { viewed: 1 } });

    // Patch specific products metadata if missing
    if (product.productModel === 'BHPALLU149') {
      if (!product.stitches) (product as any).stitches = '24,500';
      if (!product.dimensions) (product as any).dimensions = '250mm x 350mm';
      (product as any).image = 'catalog/product/HBBH149_image.jpg';
    }
    if (product.productModel === 'BHPALLU147') {
      if (!product.stitches) (product as any).stitches = '24,500';
      if (!product.dimensions) (product as any).dimensions = '250mm x 350mm';
      (product as any).image = 'catalog/product/HBBH147_image.jpg';
    }

    // Attach stats
    const [productWithStats] = await this.attachReviewStats([product]);
    const [finalProduct] = await this.applyGlobalSales([productWithStats]);
    return finalProduct;
  }

  async findRelated(identifier: string, limit: number = 8) {
    const currentProduct: any = await this.findOne(identifier);
    const categoryIds = Array.isArray(currentProduct.categories)
      ? currentProduct.categories.map((category: any) => category?._id || category).filter(Boolean)
      : [];

    if (categoryIds.length === 0) {
      return [];
    }

    const filters: any = {
      status: true,
      _id: { $ne: currentProduct._id },
      categories: { $in: categoryIds.map((id: any) => new Types.ObjectId(id)) },
    };

    const related = await this.productModel.find(filters)
      .populate('categories', 'name')
      .populate('languageId', 'name code')
      .populate('options.option', 'name sortOrder')
      .sort({ createdAt: -1 })
      .limit(Math.max(1, Math.min(limit, 20)))
      .lean();

    const withStats = await this.attachReviewStats(related);
    return this.applyGlobalSales(withStats);
  }

  async getProductCatalogSummary(identifier: string) {
    const product: any = await this.findOne(identifier);

    // Prepare product data for PDF
    const pdfData = {
      productModel: product.productModel,
      sku: product.sku,
      stitches: product.stitches,
      dimensions: product.dimensions,
      colourNeedles: product.colourNeedles,
      image: product.image || undefined,
    };

    const buffer = await generateProductPDF(pdfData);

    return {
      buffer,
      fileName: `${product.productModel}_Catalog.pdf`,
      mimeType: 'application/pdf',
    };
  }

  private async attachReviewStats(products: any[]) {
    if (!products || products.length === 0) return products;

    const productIds = products.map(p => p._id);
    const reviewStats = await this.reviewModel.aggregate([
      { $match: { product: { $in: productIds }, status: true } },
      {
        $group: {
          _id: '$product',
          averageRating: { $avg: '$rating' },
          count: { $sum: 1 },
        },
      },
    ]);

    const statsMap = new Map();
    reviewStats.forEach(stat => {
      statsMap.set(stat._id.toString(), {
        averageRating: Math.round(stat.averageRating * 10) / 10,
        reviewCount: stat.count,
      });
    });

    return products.map(p => ({
      ...p,
      ...(statsMap.get(p._id.toString()) || { averageRating: 0, reviewCount: 0 }),
    }));
  }

  async create(createProductDto: any, files?: any) {
    const productData = { ...createProductDto };

    // Handle main image
    if (files?.image && files.image[0]) {
      productData.image = await saveFile(files.image[0], 'product');
    }

    // Handle additional images
    if (files?.additionalImages) {
      productData.additionalImages = await Promise.all(
        files.additionalImages.map(async (file: any, index: number) => ({
          image: await saveFile(file, 'product'),
          sortOrder: index,
        }))
      );
    }

    // Handle nested options files
    if (productData.options) {
      for (let i = 0; i < productData.options.length; i++) {
        const fileKey = `options[${i}].file`;
        if (files?.[fileKey] && files[fileKey][0]) {
          productData.options[i].uploadedFilePath = await saveFile(files[fileKey][0], 'files');
          productData.options[i].fileSize = files[fileKey][0].size;
          productData.options[i].mimeType = files[fileKey][0].mimetype;
        }
      }
    }

    const product = new this.productModel(productData);
    return await product.save();
  }

  async update(id: string, updateProductDto: any, files?: any) {
    const product = await this.productModel.findById(id);
    if (!product) throw new NotFoundException('Product not found');

    const updateData = { ...updateProductDto };

    // Handle main image update
    if (files?.image && files.image[0]) {
      if (product.image) deleteFile(product.image);
      updateData.image = await saveFile(files.image[0], 'product');
    }

    // Handle additional images replacement or addition
    // (Complex logic simplified: replace all if new ones provided, or specific logic if needed)
    if (files?.additionalImages) {
      product.additionalImages.forEach(img => deleteFile(img.image));
      updateData.additionalImages = await Promise.all(
        files.additionalImages.map(async (file: any, index: number) => ({
          image: await saveFile(file, 'product'),
          sortOrder: index,
        }))
      );
    }

    // Handle options files updates
    if (updateData.options) {
      for (let i = 0; i < updateData.options.length; i++) {
        const fileKey = `options[${i}].file`;
        if (files?.[fileKey] && files[fileKey][0]) {
          // Delete old if exists
          const oldPath = product.options[i]?.uploadedFilePath;
          if (oldPath) deleteFile(oldPath);

          updateData.options[i].uploadedFilePath = await saveFile(files[fileKey][0], 'files');
          updateData.options[i].fileSize = files[fileKey][0].size;
          updateData.options[i].mimeType = files[fileKey][0].mimetype;
        }
      }
    }

    Object.assign(product, updateData);
    return await product.save();
  }

  async remove(id: string) {
    const product = await this.productModel.findById(id);
    if (!product) throw new NotFoundException('Product not found');

    // Delete physically
    if (product.image) deleteFile(product.image);
    product.additionalImages.forEach(img => deleteFile(img.image));
    product.options.forEach(opt => deleteFile(opt.uploadedFilePath));

    await this.productModel.findByIdAndDelete(id);
    return { success: true, message: 'Product and all associated files deleted' };
  }

  async setStatus(id: string, status: boolean) {
    const product = await this.productModel.findByIdAndUpdate(id, { status }, { new: true });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async getMasterOptions() {
    return this.masterOptionModel.find({ status: true }).sort({ sortOrder: 1 });
  }

  private async applyGlobalSales(products: any[]) {
    if (!products || products.length === 0) return products;

    const config = await this.salesService.getConfig();
    const updatedProducts = [];

    for (const product of products) {
      // Sort options by sortOrder from the master option list
      const sortedOptionsRaw = (product.options || []).sort((a: any, b: any) => {
        const orderA = a.option?.sortOrder ?? 999;
        const orderB = b.option?.sortOrder ?? 999;
        return orderA - orderB;
      });

      const updatedOptions = [];
      for (const opt of sortedOptionsRaw) {
        // Pass the pre-fetched config to avoid DB query for each option
        const salePrice = await this.salesService.getDiscountedPrice(product, opt, config);
        if (salePrice < (opt.price || 0)) {
          updatedOptions.push({ ...opt, salePrice, isGlobalDiscount: true });
        } else {
          updatedOptions.push(opt);
        }
      }
      const hasGlobalDiscount = updatedOptions.some(o => o.isGlobalDiscount);
      updatedProducts.push({ ...product, options: updatedOptions, hasGlobalDiscount });
    }
    return updatedProducts;
  }
}
