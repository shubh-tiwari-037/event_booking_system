import { Test, TestingModule } from '@nestjs/testing';
import { EventbookingService } from './eventbooking.service';

describe('EventbookingService', () => {
  let service: EventbookingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventbookingService],
    }).compile();

    service = module.get<EventbookingService>(EventbookingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
