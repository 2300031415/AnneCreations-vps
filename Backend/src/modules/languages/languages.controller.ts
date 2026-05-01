import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { LanguagesService } from './languages.service';

@Controller('languages')
export class LanguagesController {
  constructor(private readonly languagesService: LanguagesService) {}

  @Get()
  findAll(@Query() query: any) {
    return this.languagesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.languagesService.findOne(id);
  }

  @Post()
  create(@Body() createLanguageDto: any) {
    return this.languagesService.create(createLanguageDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateLanguageDto: any) {
    return this.languagesService.update(id, updateLanguageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.languagesService.remove(id);
  }
}
