import { Test, TestingModule } from '@nestjs/testing';
import { CouponsService } from './coupons.service';
import { getModelToken } from '@nestjs/mongoose';
import { Coupon } from './schemas/coupon.schema';
import { CouponUsage } from './schemas/coupon-usage.schema';
import { Order } from '../orders/schemas/order.schema';

describe('CouponsService', () => {
  let service: CouponsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CouponsService,
        {
          provide: getModelToken(Coupon.name),
          useValue: {},
        },
        {
          provide: getModelToken(CouponUsage.name),
          useValue: {},
        },
        {
          provide: getModelToken(Order.name),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<CouponsService>(CouponsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
