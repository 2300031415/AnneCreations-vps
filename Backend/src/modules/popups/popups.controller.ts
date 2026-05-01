import { Controller, Get, Post, Put, Delete, Patch, Body, Param, Query } from '@nestjs/common';
import { PopupsService } from './popups.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('popups')
@Controller('popups')
export class PopupsController {
  constructor(private readonly popupsService: PopupsService) {}

  @Get('active')
  @ApiOperation({ summary: 'Get active popup for display' })
  findActive(@Query('deviceType') deviceType?: string) {
    return this.popupsService.findActive(deviceType || 'all');
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all popups (Admin Only)' })
  findAll() {
    return this.popupsService.findAll();
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get popup by ID' })
  findOne(@Param('id') id: string) {
    return this.popupsService.findOne(id);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new popup (Admin Only)' })
  create(@Body() body: any) {
    return this.popupsService.create(body);
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update popup (Admin Only)' })
  update(@Param('id') id: string, @Body() body: any) {
    return this.popupsService.update(id, body);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete popup (Admin Only)' })
  remove(@Param('id') id: string) {
    return this.popupsService.remove(id);
  }

  @Patch(':id/toggle')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle popup status (Admin Only)' })
  toggle(@Param('id') id: string) {
    return this.popupsService.toggleStatus(id);
  }
}
