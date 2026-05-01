import { Test, TestingModule } from '@nestjs/testing';
import { PopupsController } from './popups.controller';

describe('PopupsController', () => {
  let controller: PopupsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PopupsController],
    }).compile();

    controller = module.get<PopupsController>(PopupsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
