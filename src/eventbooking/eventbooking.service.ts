import { Injectable } from '@nestjs/common';
import { CreateEventbookingDto } from './dto/create-eventbooking.dto';
import { UpdateEventbookingDto } from './dto/update-eventbooking.dto';
import { PrismaService } from 'src/prisma';
import { BookingStatus, EventStatus, TransactionType } from 'src/generated/prisma/enums';
import { PaymentService } from 'src/payment/payment.service';

@Injectable()
export class EventbookingService {
  constructor(private readonly prisma: PrismaService,
     private paymentService: PaymentService,
  ) {}


  // async holdSeat(userId: number, eventId: number, quantity: number) {
  //   if (quantity <= 0) {
  //     throw new Error('Quantity must be at least 1');
  //   }

   
  //   const event = await this.prisma.event.findUnique({
  //     where: {
  //       id: eventId,
  //     },
  //   });

  //   if (!event) {
  //     throw new Error('Event not found');
  //   }

  
  //   const activeHolds = await this.prisma.seatHold.aggregate({
  //     where: {
  //       eventId,
  //       expiresAt: {
  //         gt: new Date(),
  //       },
  //     },

  //     _sum: {
  //       quantity: true,
  //     },
  //   });

  //   const heldSeats = activeHolds._sum.quantity || 0;

   
  //   const availableSeats = event.maxTickets - event.soldTickets - heldSeats;

  //   if (availableSeats < quantity) {
  //     throw new Error('Not enough seats available');
  //   }

  
  //   const expiresAt = new Date(Date.now() + 1 * 60 * 1000);

  
  //   const hold = await this.prisma.seatHold.create({
  //     data: {
  //       userId,
  //       eventId,
  //       quantity,
  //       expiresAt,
  //     },
  //   });

  //   return {
  //     message: 'Seat hold created',
  //     holdId: hold.id,
  //     expiresAt: hold.expiresAt,
  //   };
  // }


async holdSeat( userId: number,eventId: number, quantity: number,) {

  if (quantity <= 0) {
    throw new Error(
      'Quantity must be at least 1',
    );
  }

  return await this.prisma.$transaction(
    async (tx) => {

     
      const events = await tx.$queryRaw<any[]>`

          SELECT *
          FROM event
          WHERE id = ${eventId}
          FOR UPDATE
        `;

      const event = events[0];

      if (!event) {
        throw new Error('Event not found');
      }

      const activeHolds =await tx.seatHold.aggregate({

          where: {
            eventId,
            expiresAt: {
              gt: new Date(),
            },
          },

          _sum: {
            quantity: true,
          },
        });

      const heldSeats = activeHolds._sum.quantity ?? 0;

      const availableSeats = event.maxTickets - event.soldTickets -heldSeats;

      if (availableSeats < quantity) {
        throw new Error(
          'Not enough seats available',
        );
      }

      const expiresAt = new Date(
          Date.now() + 1 * 60 * 1000,
        );

      const hold = await tx.seatHold.create({

          data: {
            userId,
            eventId,
            quantity,
            expiresAt,
          },
        });

      return {

        message: 'Seat hold created',

        holdId: hold.id,

        expiresAt: hold.expiresAt,
      };
    },
  );
}



    async createBooking(userId: number, holdId: number,) {
    
      const hold = await this.prisma.seatHold.findFirst({
          where: {
            id: holdId,
            userId,
            expiresAt: {
              gt: new Date(),
            },
          },
        });

      if (!hold) {
        throw new Error(
          'Seat hold expired or invalid',
        );
      }

      const event =await this.prisma.event.findUnique({
          where: {
            id: hold.eventId,
          },
        });

      if (!event) {
        throw new Error('Event not found');
      }

      if (event.status !== EventStatus.ACTIVE) {
    throw new Error(
      'Booking is not allowed for this event',
    );
  }

      if (
        event.soldTickets + hold.quantity >
        event.maxTickets
      ) {
        throw new Error('Not enough tickets available',);
      }

      const totalPrice = event.ticketPrice * hold.quantity;

      const wallet =await this.prisma.wallet.findUnique({
          where: {
            userId,
          },
        });

      if (!wallet) {
        throw new Error('Wallet not found');
      }

      if (wallet.balance < totalPrice) {
        throw new Error('Insufficient balance');
      }



  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);


  const bookedTickets =await this.prisma.booking.aggregate({
      where: {
        userId,
        eventId: hold.eventId,

        status: BookingStatus.CONFIRMED,

        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },

      _sum: {
        quantity: true,
      },
    });


  const holdTickets =await this.prisma.seatHold.aggregate({
      where: {
        userId,
        eventId: hold.eventId,

        expiresAt: {
          gt: new Date(),
        },

        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },

      _sum: {
        quantity: true,
      },
    });

  const totalBookedToday =(bookedTickets._sum.quantity || 0) +(holdTickets._sum.quantity || 0);


  if (totalBookedToday > 5) {
    throw new Error(
      'Maximum 5 tickets allowed per day for this event conform and holdseat mila ke',
    );
  }

    const conformBooking = await this.prisma.$transaction( async (tx) => {

          const booking =await tx.booking.create({
              data: {
                userId,
                eventId: hold.eventId,
                quantity: hold.quantity,
                totalPrice,
                status:
                  BookingStatus.PENDING,
              },
            });

          await tx.event.update({
            where: {
              id: hold.eventId,
            },
            data: {
              soldTickets: {
                increment: hold.quantity,
              },
            },
          });

          await this.paymentService.processBookingPayment(
            tx,
            booking,
            event,
            userId,
            totalPrice,
          );

          const updatedBooking= await tx.booking.update({
            where:{id:booking.id},
            data: {
            status: BookingStatus.CONFIRMED,
          },
          });

          await tx.seatHold.delete({
            where: {
              id: hold.id,
            },
          });

          return updatedBooking;
        },
      );

      return {
        message:'Booking confirmed successfully',
        status:'success',

    data: {
      bookingId: conformBooking.id,
      eventId: event.id,
      eventName: event.eventTitle,
      quantity: hold.quantity,
      totalPrice,
      bookingStatus: BookingStatus.CONFIRMED,
      bookedAt: new Date(),
    },
    }}




  async getAllBookings() {
    return await this.prisma.booking.findMany({
      include: {
        user: true,
        event: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }



  async getUserBookings(userId: number) {
    return this.prisma.booking.findMany({
      where: { userId },
      include: {
        event: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  };

  

  }
