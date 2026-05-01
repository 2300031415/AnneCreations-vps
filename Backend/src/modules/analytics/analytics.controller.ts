import { Controller, Get, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('init-session')
  @ApiOperation({ summary: 'Initialize analytics session' })
  async initSession() {
    return { success: true, message: 'Analytics session initialized' };
  }

  @Get('online-users')
  @ApiOperation({ summary: 'Get online users analytics' })
  async getOnlineUsers(@Query('page') page?: string, @Query('limit') limit?: string) {
    const result = await this.analyticsService.getOnlineUsers();
    const currentPage = Math.max(1, Number(page) || 1);
    const perPage = Math.max(1, Number(limit) || 20);
    const start = (currentPage - 1) * perPage;
    const users = result.users.slice(start, start + perPage);

    return {
      users,
      analytics: {
        totalOnline: result.stats.total,
        customersOnline: result.stats.customers,
        guestsOnline: result.stats.guests,
      },
      pagination: {
        page: currentPage,
        limit: perPage,
        total: result.users.length,
        pages: Math.ceil(result.users.length / perPage),
      },
    };
  }
}
