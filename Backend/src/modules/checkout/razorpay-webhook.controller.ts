import { Body, Controller, Post, Headers, BadRequestException, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CheckoutService } from './checkout.service';
import { WalletService } from '../wallet/wallet.service';
import { validateWebhookSignature } from '../../common/utils/razorpay.utils';

@ApiTags('webhooks')
@Controller('webhooks/razorpay')
export class RazorpayWebhookController {
  constructor(
    private readonly checkoutService: CheckoutService,
    private readonly walletService: WalletService
  ) {}

  @Post()
  @ApiOperation({ summary: 'Handle Razorpay webhooks for payment notifications' })
  async handleWebhook(@Body() body: any, @Headers('x-razorpay-signature') signature: string, @Req() req: any) {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    
    if (webhookSecret) {
      if (!signature) {
        throw new BadRequestException('Missing Razorpay signature');
      }

      const rawBody = req.rawBody ? req.rawBody.toString() : JSON.stringify(body);
      const isValid = validateWebhookSignature(rawBody, signature, webhookSecret);
      if (!isValid) {
        console.error('[Webhook] Invalid signature received');
        throw new BadRequestException('Invalid signature');
      }
    }

    const event = body.event;
    console.log(`[Webhook] Received Razorpay event: ${event}`);

    // Handle Order Paid event
    if (event === 'order.paid') {
      const orderEntity = body.payload.order.entity;
      const paymentEntity = body.payload.payment.entity;
      
      const razorpayOrderId = orderEntity.id;
      const razorpayPaymentId = paymentEntity.id;
      const notes = orderEntity.notes || paymentEntity.notes;
      const amount = paymentEntity.amount / 100; // Convert paise to INR

      if (notes?.type === 'wallet_topup') {
        await this.walletService.handleRazorpayWebhook(razorpayOrderId, razorpayPaymentId, amount, notes);
      } else {
        await this.checkoutService.handleRazorpayWebhook(razorpayOrderId, razorpayPaymentId);
      }
    } 
    // Fallback: Payment Captured event
    else if (event === 'payment.captured') {
      const paymentEntity = body.payload.payment.entity;
      const razorpayOrderId = paymentEntity.order_id;
      const razorpayPaymentId = paymentEntity.id;
      const notes = paymentEntity.notes;
      const amount = paymentEntity.amount / 100;

      if (razorpayOrderId) {
        if (notes?.type === 'wallet_topup') {
          await this.walletService.handleRazorpayWebhook(razorpayOrderId, razorpayPaymentId, amount, notes);
        } else {
          await this.checkoutService.handleRazorpayWebhook(razorpayOrderId, razorpayPaymentId);
        }
      }
    }

    return { success: true };
  }
}
