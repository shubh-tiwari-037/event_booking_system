import { Test, TestingModule } from '@nestjs/testing';
import { EventbookingController } from './eventbooking.controller';
import { EventbookingService } from './eventbooking.service';

describe('EventbookingController', () => {
  let controller: EventbookingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventbookingController],
      providers: [EventbookingService],
    }).compile();

    controller = module.get<EventbookingController>(EventbookingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
