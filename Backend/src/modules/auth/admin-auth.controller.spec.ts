import { Test, TestingModule } from '@nestjs/testing';
import { AdminAuthController } from './admin-auth.controller';
import { AuthService } from './auth.service';
import { AdminsService } from '../users/services/admins.service';

describe('AdminAuthController', () => {
  let controller: AdminAuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminAuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            validateAdmin: jest.fn(),
            loginAdmin: jest.fn(),
          },
        },
        {
          provide: AdminsService,
          useValue: {
            findOne: jest.fn(),
            findByUsernameOrEmail: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AdminAuthController>(AdminAuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
