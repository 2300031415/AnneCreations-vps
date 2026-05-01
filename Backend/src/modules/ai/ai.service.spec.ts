import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from './ai.service';
import { getModelToken } from '@nestjs/mongoose';
import { Product } from '../products/schemas/product.schema';
import { Order } from '../orders/schemas/order.schema';
import { ConfigService } from '@nestjs/config';
import { DownloadsService } from '../downloads/downloads.service';

describe('AiService', () => {
  let service: AiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        { provide: getModelToken(Product.name), useValue: {} },
        { provide: getModelToken(Order.name), useValue: {} },
        { provide: ConfigService, useValue: { get: jest.fn() } },
        { provide: DownloadsService, useValue: { verifyPurchase: jest.fn(), getDownloadPath: jest.fn() } },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
