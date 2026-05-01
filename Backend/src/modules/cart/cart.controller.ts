import { Controller, Get, Post, Body, Param, Delete, Put, Req, Headers, UnauthorizedException } from '@nestjs/common';
import { CartService } from './cart.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import * as jwt from 'jsonwebtoken';

function getCustomerId(req: any): string {
  const authHeader = req.headers?.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedException('Not authenticated');
  }

  try {
    const token = authHeader.substring(7);
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'anne_creations_secret_key_2024');
    return decoded.id;
  } catch (error) {
    throw new UnauthorizedException('Invalid or expired token');
  }
}

@ApiTags('cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get cart for authenticated customer' })
  async getCart(@Req() req: any) {
    const customerId = getCustomerId(req);
    return this.cartService.getCart(customerId);
  }

  @Post('add')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add product to cart' })
  async addToCart(@Req() req: any, @Body('productId') productId: string, @Body('options') options: string[] = []) {
    const customerId = getCustomerId(req);
    return this.cartService.addToCart(customerId, productId, options);
  }

  @Delete('remove/:productId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove product from cart' })
  async removeFromCart(@Req() req: any, @Param('productId') productId: string) {
    const customerId = getCustomerId(req);
    return this.cartService.removeFromCart(customerId, productId);
  }

  @Post('clear')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Clear entire cart' })
  async clearCart(@Req() req: any) {
    const customerId = getCustomerId(req);
    return this.cartService.clearCart(customerId);
  }

  @Put('items/:productId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update cart item options' })
  async updateCartItem(@Req() req: any, @Param('productId') productId: string, @Body('options') options: string[] = []) {
    const customerId = getCustomerId(req);
    return this.cartService.addToCart(customerId, productId, options);
  }
}
