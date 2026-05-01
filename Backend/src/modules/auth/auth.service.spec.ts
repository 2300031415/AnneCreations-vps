import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { AdminsService } from '../users/services/admins.service';
import { CustomersService } from '../users/services/customers.service';
import { getModelToken } from '@nestjs/mongoose';
import { Otp } from './schemas/otp.schema';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: AdminsService, useValue: {} },
        { provide: CustomersService, useValue: {} },
        { provide: JwtService, useValue: { sign: jest.fn() } },
        { provide: getModelToken(Otp.name), useValue: {} },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
