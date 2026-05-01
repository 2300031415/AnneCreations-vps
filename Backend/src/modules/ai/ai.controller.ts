import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { AiService } from './ai.service';

@ApiTags('ai')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  @ApiOperation({ summary: 'Chat with Anne assistant' })
  async chat(@Body('message') message: string) {
    const data = await this.aiService.chat(message || '');
    return data;
  }

  @Post('verify')
  @ApiOperation({ summary: 'Verify an order/product and return a secure download link' })
  async verify(@Body('orderId') orderId: string, @Body('productId') productId: string) {
    const data = await this.aiService.verifyAndLink(orderId, productId);
    return data;
  }

  @Get('download/:token')
  @ApiOperation({ summary: 'Download a verified file from AI support link' })
  async download(@Param('token') token: string, @Res() res: Response) {
    const { file, productName, optionName } = await this.aiService.resolveDownloadToken(token);
    const safeProductName = productName.replace(/[^a-zA-Z0-9_-]+/g, '_');
    const safeOptionName = optionName.replace(/[^a-zA-Z0-9_-]+/g, '_');

    res.setHeader('Content-Type', file.mimeType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${safeProductName}_${safeOptionName}_${file.fileName}"`,
    );
    return res.sendFile(file.fullPath);
  }
}
