import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { getModelToken } from '@nestjs/mongoose';
import { Product } from './schemas/product.schema';
import { Order } from '../orders/schemas/order.schema';
import { Review } from '../reviews/schemas/review.schema';
import { Language } from '../languages/schemas/language.schema';

describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: getModelToken(Product.name), useValue: {} },
        { provide: getModelToken(Order.name), useValue: {} },
        { provide: getModelToken(Review.name), useValue: {} },
        { provide: getModelToken(Language.name), useValue: {} },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
