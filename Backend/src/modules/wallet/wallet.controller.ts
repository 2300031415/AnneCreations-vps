import { Body, Controller, Get, Post, Req, UnauthorizedException } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import * as jwt from 'jsonwebtoken';
import { WalletService } from './wallet.service';

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

@ApiTags('wallet')
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get wallet balance and transactions' })
  async getWallet(@Req() req: any) {
    const customerId = getCustomerId(req);
    const data = await this.walletService.getWallet(customerId);
    return { success: true, data };
  }

  @Post('create-add-money-order')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Razorpay order for wallet top-up' })
  async createAddMoneyOrder(@Req() req: any, @Body('amount') amount: number) {
    const customerId = getCustomerId(req);
    const data = await this.walletService.createAddMoneyOrder(customerId, Number(amount));
    return { success: true, data };
  }

  @Post('verify-add-money')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify wallet top-up payment and credit wallet' })
  async verifyAddMoney(@Req() req: any, @Body() body: any) {
    const customerId = getCustomerId(req);
    const data = await this.walletService.verifyAddMoney(customerId, {
      razorpayPaymentId: body.razorpayPaymentId,
      razorpayOrderId: body.razorpayOrderId,
      razorpaySignature: body.razorpaySignature,
      amount: Number(body.amount),
    });
    return { success: true, data };
  }

  @Post('pay-order')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Pay for an order using wallet balance' })
  async payOrder(@Req() req: any, @Body('orderId') orderId: string) {
    const customerId = getCustomerId(req);
    const data = await this.walletService.payWithWallet(customerId, orderId);
    return { success: true, data };
  }
}
