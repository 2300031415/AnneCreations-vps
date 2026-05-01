import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SettingsService } from './settings.service';

@ApiTags('settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'List all settings' })
  async findAll() {
    const data = await this.settingsService.findAll();
    return { success: true, data };
  }

  @Get('public')
  @ApiOperation({ summary: 'Get public storefront settings' })
  async getPublic() {
    const data = await this.settingsService.getPublicSettings();
    return { success: true, data };
  }

  @Get(':key')
  @ApiOperation({ summary: 'Get setting by key' })
  async findOne(@Param('key') key: string) {
    const data = await this.settingsService.findByKey(key);
    return { success: true, data };
  }

  @Post(':key')
  @ApiOperation({ summary: 'Create or update setting by key' })
  async update(@Param('key') key: string, @Body() body: any) {
    const data = await this.settingsService.updateByKey(key, body.value, body.description);
    return { success: true, data };
  }
}
