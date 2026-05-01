import { Body, Controller, Delete, Get, Param, Post, Req, UnauthorizedException } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import * as jwt from 'jsonwebtoken';
import { CheckoutService } from './checkout.service';

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

@ApiTags('checkout')
@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post('start')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Start checkout for authenticated customer' })
  async startCheckout(@Req() req: any, @Body() body: any) {
    const customerId = getCustomerId(req);
    const order = await this.checkoutService.startCheckout(customerId, body);
    return { success: true, data: { orderId: String(order._id), orderNumber: order.orderNumber } };
  }

  @Get(':id/status')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get checkout status for an order' })
  async getCheckoutStatus(@Req() req: any, @Param('id') orderId: string) {
    const customerId = getCustomerId(req);
    const data = await this.checkoutService.getCheckoutStatus(customerId, orderId);
    return { success: true, data };
  }

  @Delete(':id/cancel')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel a pending checkout order' })
  async cancelCheckout(@Req() req: any, @Param('id') orderId: string) {
    const customerId = getCustomerId(req);
    return this.checkoutService.cancelCheckout(customerId, orderId);
  }

  @Post('payment/create')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create payment order for checkout' })
  async createPayment(@Req() req: any, @Body('orderId') orderId: string) {
    const customerId = getCustomerId(req);
    const data = await this.checkoutService.createPaymentOrder(customerId, orderId);
    return { success: true, data };
  }

  @Post('payment/verify')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify checkout payment' })
  async verifyPayment(@Req() req: any, @Body() body: any) {
    const customerId = getCustomerId(req);
    const data = await this.checkoutService.completeCheckout(customerId, body);
    return { success: true, data };
  }

  @Post('retry-payment')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Retry payment for a pending order' })
  async retryPayment(@Req() req: any, @Body('orderId') orderId: string) {
    const customerId = getCustomerId(req);
    const data = await this.checkoutService.retryPayment(customerId, orderId);
    return { success: true, data };
  }
}
