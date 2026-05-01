import { Test, TestingModule } from '@nestjs/testing';
import { CheckoutService } from './checkout.service';
import { getModelToken } from '@nestjs/mongoose';
import { Cart } from '../cart/schemas/cart.schema';
import { Order } from '../orders/schemas/order.schema';
import { Counter } from '../../models/counter.model';
import { Coupon } from '../coupons/schemas/coupon.schema';
import { CouponUsage } from '../coupons/schemas/coupon-usage.schema';

describe('CheckoutService', () => {
  let service: CheckoutService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckoutService,
        { provide: getModelToken(Cart.name), useValue: {} },
        { provide: getModelToken(Order.name), useValue: {} },
        { provide: getModelToken(Counter.name), useValue: {} },
        { provide: getModelToken(Coupon.name), useValue: {} },
        { provide: getModelToken(CouponUsage.name), useValue: {} },
      ],
    }).compile();

    service = module.get<CheckoutService>(CheckoutService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
