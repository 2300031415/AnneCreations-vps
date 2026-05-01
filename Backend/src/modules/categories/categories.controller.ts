import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { CategoriesService } from './categories.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'List all active categories' })
  async findAll(@Query() query: any) {
    const data = await this.categoriesService.findAll(query);
    return { success: true, data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID' })
  async findOne(@Param('id') id: string) {
    const data = await this.categoriesService.findOne(id);
    return { success: true, data };
  }

  @Post()
  @ApiOperation({ summary: 'Create a category' })
  @UseInterceptors(AnyFilesInterceptor())
  async create(@Body() categoryData: any, @UploadedFiles() rawFiles: any) {
    try {
      const files: any = {};
      if (Array.isArray(rawFiles)) {
        for (const file of rawFiles) {
          if (!files[file.fieldname]) files[file.fieldname] = [];
          files[file.fieldname].push(file);
        }
      }
      const parsedData = typeof categoryData.data === 'string' ? JSON.parse(categoryData.data) : categoryData;

      // Sanitize "undefined"/"null" string literals that break Mongoose casting
      const sanitizeObj = (obj: any) => {
        if (!obj || typeof obj !== 'object') return;
        for (const key in obj) {
          if (obj[key] === 'undefined' || obj[key] === 'null' || obj[key] === '') delete obj[key];
          else if (typeof obj[key] === 'object') sanitizeObj(obj[key]);
        }
      };
      sanitizeObj(parsedData);

      return await this.categoriesService.create(parsedData, files);
    } catch (e: any) {
      require('fs').writeFileSync('C:\\Users\\gmano\\.gemini\\antigravity\\brain\\error.log', e.stack);
      throw e;
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a category' })
  @UseInterceptors(AnyFilesInterceptor())
  async update(@Param('id') id: string, @Body() updateData: any, @UploadedFiles() rawFiles: any) {
    const files: any = {};
    if (Array.isArray(rawFiles)) {
      for (const file of rawFiles) {
        if (!files[file.fieldname]) files[file.fieldname] = [];
        files[file.fieldname].push(file);
      }
    }
      const parsedData = typeof updateData.data === 'string' ? JSON.parse(updateData.data) : updateData;

      const sanitizeObj = (obj: any) => {
        if (!obj || typeof obj !== 'object') return;
        for (const key in obj) {
          if (obj[key] === 'undefined' || obj[key] === 'null' || obj[key] === '') delete obj[key];
          else if (typeof obj[key] === 'object') sanitizeObj(obj[key]);
        }
      };
      sanitizeObj(parsedData);

      return await this.categoriesService.update(id, parsedData, files);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a category' })
  async remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}
