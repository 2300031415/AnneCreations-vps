import { Controller, Get } from '@nestjs/common';
import { SystemService } from './system.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('system')
@Controller('system')
export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get database collection statistics' })
  async getStats() {
    return this.systemService.getDatabaseStats();
  }

  @Get('health')
  @ApiOperation({ summary: 'Get system health' })
  getHealth() {
    return this.systemService.getHealth();
  }
}
