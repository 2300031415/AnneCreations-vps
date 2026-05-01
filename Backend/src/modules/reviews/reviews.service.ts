import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Review, ReviewDocument } from './schemas/review.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async create(customerId: string, productId: string, rating: number, comment?: string) {
    if (rating < 1 || rating > 5) throw new BadRequestException('Rating must be between 1 and 5');
    
    const product = await this.productModel.findById(productId);
    if (!product) throw new NotFoundException('Product not found');

    const existing = await this.reviewModel.findOne({ product: new Types.ObjectId(productId), user: new Types.ObjectId(customerId) } as any);
    if (existing) throw new ConflictException('You have already reviewed this product');

    const review = new this.reviewModel({
      product: new Types.ObjectId(productId),
      user: new Types.ObjectId(customerId),
      rating,
      comment,
      status: true // Auto-approve for now or based on setting
    });

    return await review.save();
  }

  async findByProduct(productId: string, query: any) {
    if (!Types.ObjectId.isValid(productId)) throw new BadRequestException('Invalid product ID');

    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
    const skip = (page - 1) * limit;

    const filters: any = { product: new Types.ObjectId(productId), status: true };

    const reviews = await this.reviewModel.find(filters)
      .populate('user', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await this.reviewModel.countDocuments(filters);

    const stats = await this.reviewModel.aggregate([
      { $match: filters },
      { $group: { _id: '$product', averageRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);

    const averageRating = stats.length > 0 ? stats[0].averageRating : 0;

    return {
      data: reviews,
      meta: {
        averageRating: parseFloat(averageRating.toFixed(1)),
        totalReviews: total,
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async updateStatus(id: string, status: boolean) {
    const review = await this.reviewModel.findByIdAndUpdate(id, { status }, { new: true });
    if (!review) throw new NotFoundException('Review not found');
    return review;
  }

  async remove(id: string) {
    const review = await this.reviewModel.findByIdAndDelete(id);
    if (!review) throw new NotFoundException('Review not found');
    return review;
  }
  async getBulkStats(productIds: string[]) {
    const objectIds = productIds.map(id => new Types.ObjectId(id));
    
    const stats = await this.reviewModel.aggregate([
      { $match: { product: { $in: objectIds }, status: true } },
      { 
        $group: { 
          _id: '$product', 
          averageRating: { $avg: '$rating' }, 
          totalReviews: { $sum: 1 } 
        } 
      }
    ]);

    // Convert to map for easy lookup
    const statsMap: Record<string, any> = {};
    stats.forEach(s => {
      statsMap[s._id.toString()] = {
        averageRating: parseFloat(s.averageRating.toFixed(1)),
        totalReviews: s.totalReviews
      };
    });

    return statsMap;
  }
}
