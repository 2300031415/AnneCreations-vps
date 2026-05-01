import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { AdminsService } from './services/admins.service';
import { CustomersService } from './services/customers.service';

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: AdminsService,
          useValue: {
            findAll: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: CustomersService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
