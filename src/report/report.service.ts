import { UserType } from '@Common';
import { Injectable } from '@nestjs/common';
import { platform } from 'node:os';
import { eventNames } from 'node:process';
import {
  BookingStatus,
  TransactionReason,
  TransactionType,
} from 'src/generated/prisma/enums';
import { PrismaService } from 'src/prisma';

@Injectable()
export class ReportService {
  constructor(private readonly prisma: PrismaService) {}

  async adminReportData() {
    return this.prisma.$transaction(async (tx) => {
      const totalUsers = await tx.user.count({
        where: { role: 'USER' },
      });

      const totalManager = await tx.user.count({
        where: { role: 'MANAGER' },
      });

      const suspendedUsers = await tx.user.count({
        where: { status: 'Blocked' },
      });

      const totalEvents = await tx.event.count({});

      const activeEvents = await tx.event.count({
        where: { status: 'ACTIVE' },
      });

      const suspendedEvents = await tx.event.count({
        where: { status: 'INACTIVE' },
      });

      const confirmedBookings = await tx.booking.count({
        where: { status: 'CONFIRMED' },
      });

      const pendingBookings = await tx.booking.count({
        where: { status: 'PENDING' },
      });

      const managerShare = await tx.transaction.aggregate({
        where: {
          reason: TransactionReason.MANAGER_SHARE,
        },

        _sum: {
          amount: true,
        },
      });

      const adminShare = await tx.adminTransaction.aggregate({
        where: {
          reason: TransactionReason.ADMIN_SHARE,
        },

        _sum: {
          amount: true,
        },
      });

      const adminRevenue = adminShare._sum.amount || 0;
      const managerRevenue = managerShare._sum.amount || 0;
      const totalRevenue = adminRevenue + managerRevenue;

      return {
        status: 'success',

        data: {
          users: {
            totalUsers: totalUsers,
            totalManagers: totalManager,
            suspendedUsers: suspendedUsers,
          },

          events: {
            totalEvents: totalEvents,
            activeEvents: activeEvents,
            suspendedEvents: suspendedEvents,
          },

          bookings: {
            confirmedBooking: confirmedBookings,
            pendingBookings: pendingBookings,
          },

          earnings: {
            adminTotalEarnings: adminRevenue,
            managerTotalEarnings: managerRevenue,
            totalRevenueOnTicketBooking: totalRevenue,
          },
        },
      };
    });
  }

  async managerData(managerId: number) {
    return await this.prisma.$transaction(async (tx) => {
      const totalEvents = await tx.event.count({
        where: {
          managerId,
        },
      });

      const activeEvents = await tx.event.count({
        where: {
          managerId,
          status: 'ACTIVE',
        },
      });

      const suspendedEvents = await tx.event.count({
        where: {
          managerId,
          status: 'INACTIVE',
        },
      });

      const ConfirmedBookings = await tx.booking.count({
        where: {
          event: {
            managerId,
          },
          status: 'CONFIRMED',
        },
      });

      const PandingBookings = await tx.booking.count({
        where: {
          event: {
            managerId,
          },
          status: 'PENDING',
        },
      });

      const managerRevenue = await tx.transaction.aggregate({
        where: {
          reason: TransactionReason.MANAGER_SHARE,
          booking: {
            event: {
              managerId,
            },
            status: 'CONFIRMED',
          },
        },
        _sum: {
          amount: true,
        },
      });

      const managerShare = managerRevenue._sum.amount || 0;

      return {
        status: 'success',

        data: {
          events: {
            total: totalEvents,
            active: activeEvents,
            suspended: suspendedEvents,
          },

          bookings: {
            confirmed: ConfirmedBookings,
            pending: PandingBookings,
          },

          earnings: {
            manager: managerShare,
          },
        },
      };
    });
  }



  async getPlatformRevenue(eventId: number) {

     const event =await this.prisma.event.findUnique({

      where: {
        id: eventId,
      },

      include: {
        manager: true,
      },
    });

  if (!event) {
    throw new Error('Event not found');
  }

    const revenue = await this.prisma.adminTransaction.aggregate({
      where: {
        reason: TransactionReason.ADMIN_SHARE,
        booking: {
         is:{
          eventId: eventId,
            status: BookingStatus.CONFIRMED,
         }
            
          },
      },

       _sum: {
          amount: true,
        },
    });

    return {
      message:'paltform revenue for this event',
       managerName:`${event.manager.firstname} ${event.manager.lastname}`,
      eventId,
      eventName:event.eventTitle,
      platformRevenue: revenue._sum?.amount|| 0,
    };
  }




  async getEventWiseReport(eventId: number,userId:number) {
  
    const event = await this.prisma.event.findUnique({
      where: { id: eventId ,managerId:userId},

      include: {
        manager: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
            email: true,
          },
        },
        bookings: {
          include: {
            user: {
              select: {
                id: true,
                firstname: true,
                lastname: true,
                email: true,
              },
            },

           
          },
        },
      },
    });

    if (!event) {
      throw new Error('Event not found');
    }

   
    const totalBookings = await this.prisma.booking.count({
      where: {
        eventId,
      },
    });

    
    const confirmedBookings = await this.prisma.booking.count({
      where: {
        eventId,
        status: BookingStatus.CONFIRMED,
      },
    });

    const cancelledBookings = await this.prisma.booking.count({
      where: {
        eventId,
        status: BookingStatus.CANCELLED,
      },
    });


    
    const totalRevenue = await this.prisma.transaction.aggregate({
      where: {
        booking: {
          eventId,
        },
      },

      _sum: {
        amount: true,
      },
    });

   
    const adminRevenue = await this.prisma.adminTransaction.aggregate({
      where: {
        booking: {
          eventId,
        },

        reason: TransactionReason.ADMIN_SHARE,
      },

      _sum: {
        amount: true,
      },
    });

  
    let eventCurrentStatus = '';

    const now = new Date();

    if (event.date > now) {
      eventCurrentStatus = 'Upcoming';
    } else {
      eventCurrentStatus = 'Completed';
    }

    
    const totalSeats = event.maxTickets || 0;
const soldSeats = totalBookings
    const availableSeats = totalSeats - totalBookings;

    return {
      message: 'Event wise report fetched successfully',

      eventReport: {
        eventId: event.id,
        eventName: event.eventTitle,
        eventDate: event.date,
         eventStatusFromDB: event.status,
        currentEventStatus: eventCurrentStatus,
      venue: event.venue,
        manager: event.manager,
        totalSeats,
        soldSeats,
        availableSeats,
        totalBookings,
        confirmedBookings,
        cancelledBookings,
        totalRevenue: totalRevenue._sum.amount || 0,
        adminRevenue: adminRevenue._sum.amount || 0,
        managerRevenue:
          (totalRevenue._sum.amount || 0) -
          (adminRevenue._sum.amount || 0),

       
      },
    };
  };


}
