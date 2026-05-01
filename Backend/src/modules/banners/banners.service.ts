import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Banner, BannerDocument } from './schemas/banner.schema';

@Injectable()
export class BannersService {
  constructor(
    @InjectModel(Banner.name) private bannerModel: Model<BannerDocument>,
  ) {}

  async findAll(isAdmin: boolean = false) {
    const filters: any = {};
    if (!isAdmin) {
      // Only get banners with at least one active image
      filters.images = { $elemMatch: { status: true } };
    }

    const banners = await this.bannerModel.find(filters)
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean();

    if (!isAdmin) {
      // For public, filter out inactive images from the results
      return banners.map(banner => ({
        ...banner,
        images: banner.images.filter(img => img.status === true)
      })).filter(banner => banner.images.length > 0);
    }

    return banners;
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid banner ID');
    }

    const banner = await this.bannerModel.findById(id).lean();
    if (!banner) {
      throw new NotFoundException('Banner not found');
    }

    return banner;
  }

  async create(bannerData: any) {
    const banner = new this.bannerModel(bannerData);
    return await banner.save();
  }

  async update(id: string, updateData: any) {
    const banner = await this.bannerModel.findByIdAndUpdate(id, updateData, { new: true });
    if (!banner) throw new NotFoundException('Banner not found');
    return banner;
  }

  async remove(id: string) {
    const banner = await this.bannerModel.findByIdAndDelete(id);
    if (!banner) throw new NotFoundException('Banner not found');
    return banner;
  }

  async updateImageStatus(bannerId: string, imageId: string, status: boolean) {
    const banner = await this.bannerModel.findById(bannerId);
    if (!banner) throw new NotFoundException('Banner not found');

    const image = (banner.images as any[]).find(img => img._id.toString() === imageId);
    if (!image) throw new NotFoundException('Image not found in banner');

    image.status = status;
    await banner.save();
    return banner;
  }

  async deleteImages(bannerId: string, imagePaths: string[]) {
    const banner = await this.bannerModel.findById(bannerId);
    if (!banner) throw new NotFoundException('Banner not found');

    banner.images = banner.images.filter(img => !imagePaths.includes(img.image)) as any;
    await banner.save();
    return banner;
  }
}
