import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UnauthorizedException } from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import * as jwt from 'jsonwebtoken';

function getCustomerId(req: any): string {
  const authHeader = req.headers?.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedException('Not authenticated');
  }

  try {
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'anne_creations_secret_key_2024') as any;
    return decoded.id;
  } catch (error) {
    throw new UnauthorizedException('Invalid or expired token');
  }
}

@ApiTags('coupons')
@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Get('public/active')
  @ApiOperation({ summary: 'Get active public coupon' })
  async getPublicActive() {
    const data = await this.couponsService.findPublicActiveCoupon();
    return { success: true, data };
  }

  @Get('public/all-active')
  @ApiOperation({ summary: 'Get all active public coupons' })
  async getAllActive() {
    const data = await this.couponsService.findActiveCoupons();
    return { success: true, data };
  }

  @Get()
  @ApiOperation({ summary: 'List coupons' })
  async findAll(@Query() query: any) {
    const data = await this.couponsService.findAll(query);
    return { data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get coupon by ID' })
  async findOne(@Param('id') id: string) {
    const data = await this.couponsService.findOne(id);
    return { data };
  }

  @Post()
  @ApiOperation({ summary: 'Create coupon' })
  async create(@Body() body: any) {
    const data = await this.couponsService.create(body);
    return { data };
  }

  @Post('apply-coupon')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Apply coupon to current customer order' })
  async applyCoupon(@Req() req: any, @Body() body: any) {
    const customerId = getCustomerId(req);
    return this.couponsService.applyCouponToOrder(body.code, body.orderId, customerId);
  }

  @Post('remove-coupon')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove coupon from current customer order' })
  async removeCoupon(@Req() req: any, @Body() body: any) {
    const customerId = getCustomerId(req);
    return this.couponsService.removeCouponFromOrder(body.orderId, customerId);
  }

  @Get('auto-apply/:orderId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Auto apply best coupon for current customer order' })
  async autoApply(@Req() req: any, @Param('orderId') orderId: string) {
    const customerId = getCustomerId(req);
    return this.couponsService.autoApplyCoupon(orderId, customerId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update coupon' })
  async update(@Param('id') id: string, @Body() body: any) {
    const data = await this.couponsService.update(id, body);
    return { data };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete coupon' })
  async remove(@Param('id') id: string) {
    const data = await this.couponsService.remove(id);
    return { data, success: true };
  }
}
