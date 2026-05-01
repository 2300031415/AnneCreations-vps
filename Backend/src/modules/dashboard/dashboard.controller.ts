import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('sales')
  @ApiOperation({ summary: 'Dashboard sales summary' })
  async getSales(@Query('days') days?: string) {
    const data = await this.dashboardService.getSalesRevenue(days ? Number(days) : undefined);
    return {
      ...data,
      period: days ? `${days} days` : 'all',
      start_date: days ? new Date(Date.now() - Number(days) * 86400000).toISOString() : null,
      end_date: new Date().toISOString(),
      startDate: days ? new Date(Date.now() - Number(days) * 86400000).toISOString() : null,
      endDate: new Date().toISOString(),
    };
  }

  @Get('orders/new')
  async getNewOrders(@Query('days') days?: string) {
    return this.dashboardService.getNewOrders(days ? Number(days) : 30);
  }

  @Get('customers/new')
  async getNewCustomers(@Query('days') days?: string) {
    return this.dashboardService.getNewCustomers(days ? Number(days) : 30);
  }

  @Get('customers/online')
  async getOnlineCustomers() {
    return this.dashboardService.getOnlineCustomers();
  }

  @Get('revenue/yearly')
  async getYearlyRevenue(@Query('year') year?: string) {
    return this.dashboardService.getYearlyRevenue(year ? Number(year) : new Date().getFullYear());
  }

  @Get('customers/new/yearly')
  async getYearlyNewCustomers(@Query('year') year?: string) {
    return this.dashboardService.getYearlyNewCustomers(year ? Number(year) : new Date().getFullYear());
  }

  @Get('products/top')
  async getTopProducts(@Query('days') days?: string, @Query('limit') limit?: string) {
    return this.dashboardService.getTopProducts(days ? Number(days) : 30, limit ? Number(limit) : 5);
  }

  @Get('orders/recent')
  async getRecentOrders(@Query('limit') limit?: string) {
    const data = await this.dashboardService.getRecentOrders(limit ? Number(limit) : 10);
    return {
      count: data.length,
      recentOrders: data.map((order: any) => ({
        orderId: order._id,
        orderNumber: order.orderNumber,
        customer: {
          name: `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.trim(),
          email: order.customer?.email || '',
          telephone: order.customer?.mobile || '',
        },
        total: order.orderTotal,
        createdAt: order.createdAt,
        status: order.orderStatus,
        payment_method: order.paymentMethod,
        shipping_method: '',
        products: [],
      })),
    };
  }
}
