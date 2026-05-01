import { Body, Controller, Get, Param, Put, Query, Req, UnauthorizedException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import * as jwt from 'jsonwebtoken';

function getCustomerId(req: any): string {
  const authHeader = req.headers?.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedException('Not authenticated');
  }

  try {
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'anne_creations_secret_key_2024') as any;
    if (!decoded.id) throw new UnauthorizedException('Invalid token payload');
    return decoded.id;
  } catch (error) {
    throw new UnauthorizedException('Invalid or expired token');
  }
}

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  @Get('admin/all')
  @ApiOperation({ summary: 'List all orders for admin' })
  async findAllForAdmin(@Query() query: any) {
    return this.ordersService.findAll(query);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List customer orders' })
  async findAll(@Req() req: any, @Query() query: any) {
    const customerId = getCustomerId(req);
    return this.ordersService.findByCustomer(customerId, query);
  }

  @Get('my')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List current customer orders' })
  async findMine(@Req() req: any, @Query() query: any) {
    const customerId = getCustomerId(req);
    return this.ordersService.findByCustomer(customerId, query);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update order status' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Body('comment') comment: string,
  ) {
    return this.ordersService.updateStatus(id, status, comment);
  }

  @Get('customer/:customerId')
  @ApiOperation({ summary: 'Get orders by customer ID' })
  async findByCustomer(@Param('customerId') customerId: string, @Query() query: any) {
    return this.ordersService.findByCustomer(customerId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order details' })
  async findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }
}
