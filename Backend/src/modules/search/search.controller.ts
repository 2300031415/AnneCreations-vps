import { Injectable, Get, Post, Query, Body, Controller, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SearchService } from './search.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('suggestions')
  @ApiOperation({ summary: 'Get search suggestions' })
  async getSuggestions(@Query('q') q: string, @Query('limit') limit?: string) {
    const products = await this.searchService.getSuggestions(q || '', limit ? Number(limit) : 6);
    return { products };
  }

  @Post('visual')
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Visual search (Placeholder: returns random results for now)' })
  async getVisualSearch(
    @UploadedFile() file: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    return this.searchService.getVisualSearch(Number(page) || 1, Number(limit) || 8);
  }

  @Get('popular')
  @ApiOperation({ summary: 'Get popular searches' })
  async getPopularSearches(@Query('limit') limit?: string) {
    const popularSearches = await this.searchService.getPopularSearches(limit ? Number(limit) : 10);
    return { popularSearches };
  }
}
