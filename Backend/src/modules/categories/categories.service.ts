import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { saveFile, deleteFile } from '../../utils/file.utils';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async findAll(query: any, isAdmin: boolean = false) {
    const filters: any = {};
    if (!isAdmin) {
      filters.status = true;
    }

    if (query.search) {
      filters.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { description: { $regex: query.search, $options: 'i' } },
      ];
    }

    const categories = await this.categoryModel.find(filters)
      .populate('languageId', 'name code')
      .sort({ sortOrder: 1, name: 1 })
      .lean();

    // Attach product counts
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat: any) => {
        const filters: any = {
          categories: cat._id,
          status: true,
        };
        const productCount = await this.productModel.countDocuments(filters);
        return {
          ...cat,
          productCount,
        };
      })
    );

    return categoriesWithCount;
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid category ID');
    }

    const category = await this.categoryModel.findById(id)
      .populate('languageId', 'name code')
      .lean();

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const productCount = await this.productModel.countDocuments({
      categories: new Types.ObjectId(category._id.toString()),
      status: true,
    } as any);

    return {
      ...category,
      productCount,
    };
  }

  async create(categoryData: any, files?: any) {
    if (files?.image && files.image[0]) {
      categoryData.image = await saveFile(files.image[0], 'category');
    }
    const category = new this.categoryModel(categoryData);
    return await category.save();
  }

  async update(id: string, updateData: any, files?: any) {
    const category = await this.categoryModel.findById(id);
    if (!category) throw new NotFoundException('Category not found');

    if (files?.image && files.image[0]) {
      if (category.image) deleteFile(category.image);
      updateData.image = await saveFile(files.image[0], 'category');
    }

    Object.assign(category, updateData);
    return await category.save();
  }

  async remove(id: string) {
    const productCount = await this.productModel.countDocuments({ categories: new Types.ObjectId(id) } as any);
    if (productCount > 0) {
      throw new BadRequestException(`Cannot delete category with ${productCount} products`);
    }

    const category = await this.categoryModel.findByIdAndDelete(id);
    if (!category) throw new NotFoundException('Category not found');
    
    if (category.image) deleteFile(category.image);
    
    return category;
  }
}
