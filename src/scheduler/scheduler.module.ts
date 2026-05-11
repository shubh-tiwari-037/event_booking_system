import { Module } from '@nestjs/common';

import { SchedulerService } from './scheduler.service';

import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],

  providers: [SchedulerService],
})
export class SchedulerModule {}