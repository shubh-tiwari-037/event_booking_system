import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { EventStatus } from 'src/generated/prisma/enums';
import { PrismaService } from 'src/prisma';

@Injectable()
export class SchedulerService {
    constructor(private prisma:PrismaService){}

    // use cron for handling event and checking event status per hours
   @Cron('0 * * * *')
   async handleExpiredEvents(){
    const now = new Date()

    const updateEvent= await this.prisma.event.updateMany({
        where:{
            date:{
                lt:now,
            },

            status:{
                not:EventStatus.INACTIVE
            },
        },

        data:{
            status:EventStatus.INACTIVE
        }
    });

      console.log(
      `Completed Events updation: ${updateEvent.count}`,
    );
   }


  @Cron('*/5 * * * *')
  async deleteExpiredSeatHolds() {
    const now = new Date();

    const deletedHolds =
      await this.prisma.seatHold.deleteMany({
        where: {
          expiresAt: {
            lt: now,
          },
        },
      });

    // console.log(
    //   `Deleted Holds: ${deletedHolds.count}`,
    // );
  }
}
