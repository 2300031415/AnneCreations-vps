import { Test, TestingModule } from '@nestjs/testing';
import { DownloadsController } from './downloads.controller';
import { DownloadsService } from './downloads.service';

describe('DownloadsController', () => {
  let controller: DownloadsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DownloadsController],
      providers: [
        {
          provide: DownloadsService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<DownloadsController>(DownloadsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
