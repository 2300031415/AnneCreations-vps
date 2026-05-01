import { Controller, Get, Post, Body, Param, Delete, Req, UnauthorizedException } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
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

@ApiTags('wishlist')
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get customer wishlist' })
  async getWishlist(@Req() req: any) {
    const customerId = getCustomerId(req);
    const result = await this.wishlistService.getWishlist(customerId);
    return { data: result };
  }

  @Post('add')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add product to wishlist' })
  async addToWishlist(@Req() req: any, @Body('productId') productId: string) {
    const customerId = getCustomerId(req);
    return this.wishlistService.addToWishlist(customerId, productId);
  }

  @Delete('remove/:productId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove product from wishlist' })
  async removeFromWishlist(@Req() req: any, @Param('productId') productId: string) {
    const customerId = getCustomerId(req);
    return this.wishlistService.removeFromWishlist(customerId, productId);
  }
}
