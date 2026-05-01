import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SaleConfig } from './schemas/sale-config.schema';

@Injectable()
export class SalesService {
  constructor(
    @InjectModel(SaleConfig.name) private readonly saleConfigModel: Model<SaleConfig>,
  ) {}

  async getConfig() {
    let config = await this.saleConfigModel.findOne().exec();
    if (!config) {
      config = await this.saleConfigModel.create({
        isActive: false,
        discountPercentage: 0,
        targetCategories: 'ALL',
      });
    }
    return config;
  }

  async updateConfig(updateData: any) {
    let config = await this.saleConfigModel.findOne().exec();
    if (!config) {
      return await this.saleConfigModel.create(updateData);
    }
    
    config.isActive = updateData.isActive ?? config.isActive;
    config.discountPercentage = updateData.discountPercentage ?? config.discountPercentage;
    config.expiryDate = updateData.expiryDate ? new Date(updateData.expiryDate) : config.expiryDate;
    config.targetCategories = updateData.targetCategories ?? config.targetCategories;
    
    return await config.save();
  }

  async getDiscountedPrice(product: any, option: any, preFetchedConfig?: any) {
    const config = preFetchedConfig || await this.getConfig();
    if (!config || !config.isActive || config.discountPercentage <= 0) {
      return option.salePrice !== undefined ? option.salePrice : (option.price || 0);
    }
    // ... (rest same)

    const { discountPercentage, targetCategories } = config;
    
    // Normalize targetCategories to strings
    const targetCatIds = Array.isArray(targetCategories) 
        ? targetCategories.map(id => id.toString()) 
        : targetCategories;

    // Normalize product categories to strings
    const productCatIds = (product.categories || []).map((c: any) => {
      if (typeof c === 'string') return c;
      if (c instanceof Types.ObjectId) return c.toString();
      if (c && typeof c === 'object' && c._id) return c._id.toString();
      return String(c);
    });

    // Check if targeted
    let isTargeted = false;
    if (targetCatIds === 'ALL') {
      isTargeted = true;
    } else if (Array.isArray(targetCatIds)) {
      const targetSet = new Set(targetCatIds.map(id => id.toString()));
      isTargeted = productCatIds.some((catId: string) => targetSet.has(catId));
    }

    if (!isTargeted) {
      return option.salePrice !== undefined ? option.salePrice : (option.price || 0);
    }

    const globalSalePrice = Math.floor((option.price || 0) * (1 - discountPercentage / 100));
    const currentSalePrice = option.salePrice !== undefined ? option.salePrice : (option.price || 0);

    return globalSalePrice < currentSalePrice ? globalSalePrice : currentSalePrice;
  }
}
