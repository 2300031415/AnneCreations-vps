import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SearchLog, SearchLogDocument } from './schemas/search-log.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { Category, CategoryDocument } from '../categories/schemas/category.schema';

@Injectable()
export class SearchService {
  constructor(
    @InjectModel(SearchLog.name) private searchLogModel: Model<SearchLogDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  async getSuggestions(query: string, limit: number = 6) {
    const filters: any = { status: true };
    const escapedQuery = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    if (escapedQuery) {
      // Find categories matching query
      const matchingCategories = await this.categoryModel.find({
        name: { $regex: escapedQuery, $options: 'i' }
      }).select('_id').lean();

      const categoryIds = matchingCategories.map(cat => cat._id);

      filters.$or = [
        { productModel: { $regex: escapedQuery, $options: 'i' } },
        { sku: { $regex: escapedQuery, $options: 'i' } },
        { description: { $regex: escapedQuery, $options: 'i' } },
        { 'seo.metaKeyword': { $regex: escapedQuery, $options: 'i' } },
        { categories: { $in: categoryIds } }
      ];
    }

    const products = await this.productModel.find(filters)
      .populate('categories', 'name')
      .sort({ viewed: -1, salesCount: -1 })
      .limit(limit)
      .lean();

    const formattedProducts = products.map((p: any) => ({
      _id: p._id.toString(),
      productModel: p.productModel,
      sku: p.sku,
      image: p.image ? (p.image.startsWith('catalog') ? p.image : `catalog/${p.image}`) : null,
      category: p.categories?.[0]?.name || 'Uncategorized',
      price: p.options?.[0]?.price || 0,
    }));

    // Log search asynchronously
    if (escapedQuery) {
      this.logSearch(query, products.length).catch(err => console.error('Search logging failed', err));
    }

    return formattedProducts;
  }

  private async logSearch(searchTerm: string, resultsCount: number) {
    const log = new this.searchLogModel({
      searchTerm: searchTerm.trim(),
      resultsCount,
      searchTime: Date.now(),
    });
    await log.save();
  }

  async getPopularSearches(limit: number = 10) {
    return await this.searchLogModel.aggregate([
      { $match: { searchTerm: { $exists: true, $ne: '' } } },
      { $group: { _id: '$searchTerm', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit },
    ]);
  }

  async getAnalytics(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const stats = await this.searchLogModel.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: null,
          totalSearches: { $sum: 1 },
          averageResults: { $avg: '$resultsCount' },
        },
      },
    ]);

    return stats[0] || { totalSearches: 0, averageResults: 0 };
  }

  async getVisualSearch(page: number = 1, limit: number = 8) {
    const skip = (page - 1) * limit;
    const products = await this.productModel.find({ status: true })
      .populate('categories', 'name')
      .sort({ viewed: -1, salesCount: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await this.productModel.countDocuments({ status: true });

    const formattedProducts = products.map((p: any) => ({
      _id: p._id.toString(),
      productModel: p.productModel,
      sku: p.sku,
      image: p.image ? (p.image.startsWith('catalog') ? p.image : `catalog/${p.image}`) : null,
      category: p.categories?.[0]?.name || 'Design',
      price: p.options?.[0]?.price || 0,
    }));

    return {
      products: formattedProducts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalProducts: total,
        limit,
      }
    };
  }
}
