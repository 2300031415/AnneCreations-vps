import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { getModelToken } from '@nestjs/mongoose';
import { OnlineUser } from '../users/schemas/online-user.schema';
import { UserActivity } from '../users/schemas/user-activity.schema';
import { SearchLog } from '../search/schemas/search-log.schema';
import { Order } from '../orders/schemas/order.schema';
import { Product } from '../products/schemas/product.schema';
import { Customer } from '../users/schemas/customer.schema';

describe('AnalyticsService', () => {
  let service: AnalyticsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: getModelToken(OnlineUser.name), useValue: {} },
        { provide: getModelToken(UserActivity.name), useValue: {} },
        { provide: getModelToken(SearchLog.name), useValue: {} },
        { provide: getModelToken(Order.name), useValue: {} },
        { provide: getModelToken(Product.name), useValue: {} },
        { provide: getModelToken(Customer.name), useValue: {} },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
