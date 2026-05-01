import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  Res,
  UseInterceptors,
  UploadedFiles,
  Req,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import type { Response } from 'express';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new product (Admin Only)' })
  @UseInterceptors(AnyFilesInterceptor())
  async create(
    @Body() body: any,
    @UploadedFiles() rawFiles: any,
  ) {
    try {
      const files: any = {};
      if (Array.isArray(rawFiles)) {
        for (const file of rawFiles) {
          if (!files[file.fieldname]) files[file.fieldname] = [];
          files[file.fieldname].push(file);
        }
      }
      // Parse nested objects if sent as strings (common with FormData)
      let productData = typeof body.data === 'string' ? JSON.parse(body.data) : body;
      if (productData && Object.keys(productData).some(k => k.includes('['))) {
        const qs = require('qs');
        productData = qs.parse(qs.stringify(productData), { allowDots: true });
      }

      const sanitizeObj = (obj: any) => {
        if (!obj || typeof obj !== 'object') return;
        for (const key in obj) {
          if (obj[key] === 'undefined' || obj[key] === 'null' || obj[key] === '') delete obj[key];
          else if (typeof obj[key] === 'object') sanitizeObj(obj[key]);
        }
      };
      sanitizeObj(productData);

      return await this.productsService.create(productData, files);
    } catch (e: any) {
      require('fs').writeFileSync('C:\\Users\\gmano\\.gemini\\antigravity\\brain\\error.log', e.stack);
      throw e;
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all products with filters' })
  async findAll(@Query() query: any, @Req() req: any) {
    // Check if admin (for showing inactive products)
    const isAdmin = req.headers.authorization?.startsWith('Bearer ');
    return this.productsService.findAll(query, isAdmin);
  }

  @Get('options')
  @ApiOperation({ summary: 'Get master list of product options (PDF, DST, etc)' })
  async getOptions() {
    return this.productsService.getMasterOptions();
  }

  @Get('category/:id')
  @ApiOperation({ summary: 'Get products by category ID' })
  async findByCategory(@Param('id') id: string, @Query() query: any) {
    return this.productsService.findByCategory(id, query);
  }

  @Get(':id/related')
  @ApiOperation({ summary: 'Get related products' })
  async findRelated(@Param('id') id: string, @Query('limit') limit?: string) {
    const data = await this.productsService.findRelated(id, limit ? Number(limit) : 8);
    return { data };
  }

  @Get(':id/pdf')
  @ApiOperation({ summary: 'Get product PDF summary' })
  async getProductPdf(@Param('id') id: string, @Res() res: Response) {
    const file = await this.productsService.getProductCatalogSummary(id);
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${file.fileName}"`);
    return res.send(file.buffer);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single product by ID or Name' })
  async findOne(@Param('id') id: string, @Req() req: any) {
    const isAdmin = req.headers.authorization?.startsWith('Bearer ');
    return this.productsService.findOne(id, isAdmin);
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update product (Admin Only)' })
  @UseInterceptors(AnyFilesInterceptor())
  async update(
    @Param('id') id: string,
    @Body() body: any,
    @UploadedFiles() rawFiles: any,
  ) {
    const files: any = {};
    if (Array.isArray(rawFiles)) {
      for (const file of rawFiles) {
        if (!files[file.fieldname]) files[file.fieldname] = [];
        files[file.fieldname].push(file);
      }
    }
    let productData = typeof body.data === 'string' ? JSON.parse(body.data) : body;
    if (productData && Object.keys(productData).some(k => k.includes('['))) {
      const qs = require('qs');
      productData = qs.parse(qs.stringify(productData), { allowDots: true });
    }

    const sanitizeObj = (obj: any) => {
      if (!obj || typeof obj !== 'object') return;
      for (const key in obj) {
        if (obj[key] === 'undefined' || obj[key] === 'null' || obj[key] === '') delete obj[key];
        else if (typeof obj[key] === 'object') sanitizeObj(obj[key]);
      }
    };
    sanitizeObj(productData);

    return this.productsService.update(id, productData, files);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete product (Admin Only)' })
  async remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  @Patch(':id/status')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle product status (Admin Only)' })
  async setStatus(@Param('id') id: string, @Body('status') status: boolean) {
    return this.productsService.setStatus(id, status);
  }
}
