import { Module } from '@nestjs/common';
import { EventbookingService } from './eventbooking.service';
import { EventbookingController } from './eventbooking.controller';
import { PrismaModule } from 'src/prisma';
import { PaymentService } from 'src/payment/payment.service';


@Module({
  imports:[PrismaModule],
  controllers: [EventbookingController],
  providers: [EventbookingService,PaymentService],
})
export class EventbookingModule {}
