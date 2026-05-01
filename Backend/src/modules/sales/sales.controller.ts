import { Body, Controller, Get, Put } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SalesService } from './sales.service';

@ApiTags('sales')
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get('config')
  @ApiOperation({ summary: 'Get sale configuration' })
  async getConfig() {
    const data = await this.salesService.getConfig();
    return { success: true, data };
  }

  @Put('config')
  @ApiOperation({ summary: 'Update sale configuration' })
  async updateConfig(@Body() body: any) {
    const data = await this.salesService.updateConfig(body);
    return { success: true, data };
  }
}
