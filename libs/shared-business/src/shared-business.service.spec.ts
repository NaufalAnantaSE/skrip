import { Test, TestingModule } from '@nestjs/testing';
import { SharedBusinessService } from './shared-business.service';

describe('SharedBusinessService', () => {
  let service: SharedBusinessService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SharedBusinessService],
    }).compile();

    service = module.get<SharedBusinessService>(SharedBusinessService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
