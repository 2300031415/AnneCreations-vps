import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

describe('DashboardController', () => {
  let controller: DashboardController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [
        {
          provide: DashboardService,
          useValue: {
            getSalesRevenue: jest.fn(),
            getNewOrders: jest.fn(),
            getNewCustomers: jest.fn(),
            getOnlineCustomers: jest.fn(),
            getYearlyRevenue: jest.fn(),
            getYearlyNewCustomers: jest.fn(),
            getTopProducts: jest.fn(),
            getRecentOrders: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<DashboardController>(DashboardController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
