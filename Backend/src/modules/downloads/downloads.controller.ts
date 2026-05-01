import { Controller, Get, Param, Req, Res, UnauthorizedException } from '@nestjs/common';
import { DownloadsService } from './downloads.service';
import type { Response } from 'express';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import * as jwt from 'jsonwebtoken';

function getCustomerPayload(req: any): any {
  const authHeader = req.headers?.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedException('Not authenticated');
  }
  
  try {
    const token = authHeader.substring(7);
    return jwt.verify(token, process.env.JWT_SECRET || 'anne_creations_secret_key_2024') as any;
  } catch (error) {
    throw new UnauthorizedException('Invalid or expired token');
  }
}

@ApiTags('downloads')
@Controller('downloads')
export class DownloadsController {
  constructor(private readonly downloadsService: DownloadsService) {}

  @Get(':productId/:optionId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Download purchased product file' })
  async downloadPurchasedFile(
    @Param('productId') productId: string,
    @Param('optionId') optionId: string,
    @Req() req: any,
    @Res() res: Response,
  ) {
    const payload = getCustomerPayload(req);
    await this.downloadsService.verifyPurchase(payload.id, productId, optionId);
    const file = await this.downloadsService.getDownloadPath(productId, optionId);
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${file.fileName}"`);
    return res.sendFile(file.fullPath);
  }
}
