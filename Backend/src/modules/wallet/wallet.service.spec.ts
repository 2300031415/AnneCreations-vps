import { Test, TestingModule } from '@nestjs/testing';
import { WalletService } from './wallet.service';
import { getModelToken } from '@nestjs/mongoose';
import { Wallet, WalletTransaction } from './schemas/wallet.schema';
import { Order } from '../orders/schemas/order.schema';
import { Cart } from '../cart/schemas/cart.schema';

describe('WalletService', () => {
  let service: WalletService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        { provide: getModelToken(Wallet.name), useValue: {} },
        { provide: getModelToken(WalletTransaction.name), useValue: {} },
        { provide: getModelToken(Order.name), useValue: {} },
        { provide: getModelToken(Cart.name), useValue: {} },
      ],
    }).compile();

    service = module.get<WalletService>(WalletService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
