import { Test, TestingModule } from '@nestjs/testing';
import { PopupsService } from './popups.service';

describe('PopupsService', () => {
  let service: PopupsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PopupsService],
    }).compile();

    service = module.get<PopupsService>(PopupsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
