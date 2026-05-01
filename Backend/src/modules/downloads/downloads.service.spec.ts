import { Test, TestingModule } from '@nestjs/testing';
import { DownloadsService } from './downloads.service';
import { getModelToken } from '@nestjs/mongoose';
import { Product } from '../products/schemas/product.schema';
import { Order } from '../orders/schemas/order.schema';

describe('DownloadsService', () => {
  let service: DownloadsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DownloadsService,
        {
          provide: getModelToken(Product.name),
          useValue: {},
        },
        {
          provide: getModelToken(Order.name),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<DownloadsService>(DownloadsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
