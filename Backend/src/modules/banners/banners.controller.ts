import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';
import { BannersService } from './banners.service';

const bannerUploadDir = path.join(process.cwd(), 'catalog', 'banners');

function ensureBannerUploadDir() {
  if (!fs.existsSync(bannerUploadDir)) {
    fs.mkdirSync(bannerUploadDir, { recursive: true });
  }
}

function buildStoredBannerPath(fileName: string) {
  return `catalog/banners/${fileName}`;
}

const multerLib = require('multer');

type UploadedBannerFile = {
  fieldname: string;
  filename: string;
  originalname: string;
};

@ApiTags('banners')
@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Get()
  @ApiOperation({ summary: 'List banners' })
  async findAll(@Query('admin') admin?: string) {
    const isAdmin = admin === 'true';
    const data = await this.bannersService.findAll(isAdmin);
    return {
      success: true,
      data: {
        data,
        count: data.length,
      },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get banner by ID' })
  async findOne(@Param('id') id: string) {
    const data = await this.bannersService.findOne(id);
    return { success: true, data };
  }

  @Post()
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: multerLib.diskStorage({
        destination: (_req: any, _file: any, cb: any) => {
          ensureBannerUploadDir();
          cb(null, bannerUploadDir);
        },
        filename: (_req: any, file: UploadedBannerFile, cb: any) => {
          const safeOriginal = file.originalname.replace(/\s+/g, '_');
          cb(null, `${Date.now()}_${safeOriginal}`);
        },
      }),
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create banner' })
  async create(@Body() body: any, @UploadedFiles() files: UploadedBannerFile[] = []) {
    const data = await this.bannersService.create(this.mapBannerPayload(body, files));
    return { success: true, data };
  }

  @Put(':id')
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: multerLib.diskStorage({
        destination: (_req: any, _file: any, cb: any) => {
          ensureBannerUploadDir();
          cb(null, bannerUploadDir);
        },
        filename: (_req: any, file: UploadedBannerFile, cb: any) => {
          const safeOriginal = file.originalname.replace(/\s+/g, '_');
          cb(null, `${Date.now()}_${safeOriginal}`);
        },
      }),
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update banner' })
  async update(@Param('id') id: string, @Body() body: any, @UploadedFiles() files: UploadedBannerFile[] = []) {
    const data = await this.bannersService.update(id, this.mapBannerPayload(body, files));
    return { success: true, data };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete banner' })
  async remove(@Param('id') id: string) {
    const data = await this.bannersService.remove(id);
    return { success: true, data };
  }

  private mapBannerPayload(body: any, files: UploadedBannerFile[]) {
    const normalizeList = (value: any) => {
      if (!value) return [];
      return Array.isArray(value) ? value : [value];
    };

    const existingImages = [
      ...normalizeList(body.existingMobileImages),
      ...normalizeList(body.existingWebImages),
    ].filter(Boolean);

    const uploadedImages = files
      .filter((file) => file.fieldname === 'mobileImages' || file.fieldname === 'webImages')
      .map((file) => ({
        image: buildStoredBannerPath(file.filename),
        status: true,
      }));

    return {
      title: body.title,
      description: body.description || '',
      sortOrder: Number(body.sortOrder || 0),
      status: body.status === 'false' ? false : Boolean(body.status ?? true),
      deviceType: body.deviceType || 'web',
      images: [
        ...existingImages.map((image: string) => ({
          image,
          status: true,
        })),
        ...uploadedImages,
      ],
    };
  }
}
