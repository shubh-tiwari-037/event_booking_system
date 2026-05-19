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
    const [
      totalUsers,
      totalManager,
      suspendedUsers,

      totalEvents,
      activeEvents,
      suspendedEvents,

      confirmedBookings,
      pendingBookings,

      managerShare,
      adminShare,
    ] = await Promise.all([
      this.prisma.user.count({
        where: {
          role: 'User',
        },
      }),

      this.prisma.user.count({
        where: {
          role: 'Manager',
        },
      }),

      this.prisma.user.count({
        where: {
          status: 'Blocked',
        },
      }),

      this.prisma.event.count(),

      this.prisma.event.count({
        where: {
          status: 'Active',
        },
      }),

      this.prisma.event.count({
        where: {
          status: 'Inactive',
        },
      }),

      this.prisma.booking.count({
        where: {
          status: 'Confirmed',
        },
      }),

      this.prisma.booking.count({
        where: {
          status: 'Pending',
        },
      }),

      this.prisma.transaction.aggregate({
        where: {
          reason: TransactionReason.ManagerShare,
        },

        _sum: {
          amount: true,
        },
      }),

      this.prisma.adminTransaction.aggregate({
        where: {
          reason: TransactionReason.AdminShare,
        },

        _sum: {
          amount: true,
        },
      }),
    ]);

    const adminRevenue = adminShare._sum.amount || 0;

    const managerRevenue = managerShare._sum.amount || 0;

    return {
      status: 'success',

      data: {
        users: {
          totalUsers,
          totalManagers: totalManager,
          suspendedUsers,
        },

        events: {
          totalEvents,
          activeEvents,
          suspendedEvents,
        },

        bookings: {
          confirmedBooking: confirmedBookings,
          pendingBookings,
        },

        earnings: {
          adminTotalEarnings: adminRevenue,
          managerTotalEarnings: managerRevenue,
          totalRevenueOnTicketBooking: adminRevenue + managerRevenue,
        },
      },
    };
  }


async managerData(managerId: number) {
  const [
    totalEvents,
    activeEvents,
    suspendedEvents,

    confirmedBookings,
    pendingBookings,

    managerRevenue,
  ] = await Promise.all([
    this.prisma.event.count({
      where: {
        managerId,
      },
    }),

    this.prisma.event.count({
      where: {
        managerId,
        status: 'Active',
      },
    }),

    this.prisma.event.count({
      where: {
        managerId,
        status: 'Inactive',
      },
    }),

    this.prisma.booking.count({
      where: {
        event: {
          managerId,
        },

        status: 'Confirmed',
      },
    }),

    this.prisma.booking.count({
      where: {
        event: {
          managerId,
        },

        status: 'Pending',
      },
    }),

    this.prisma.transaction.aggregate({
      where: {
        reason:
          TransactionReason.ManagerShare,

        booking: {
          event: {
            managerId,
          },

          status: 'Confirmed',
        },
      },

      _sum: {
        amount: true,
      },
    }),
  ]);

  const managerShare =
    managerRevenue._sum.amount || 0;

  return {
    status: 'success',

    data: {
      events: {
        totalEvents: totalEvents,
        activeEvents: activeEvents,
        suspendedEvents: suspendedEvents,
      },

      bookings: {
        confirmedBookings: confirmedBookings,
        pendingBookings: pendingBookings,
      },

      earnings: {
        managerEarnings: managerShare,
      },
    },
  };
}

  async getPlatformRevenue(eventId: number) {
    const event = await this.prisma.event.findUnique({
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
        reason: TransactionReason.AdminShare,
        booking: {
          is: {
            eventId: eventId,
            status: BookingStatus.Confirmed,
          },
        },
      },

      _sum: {
        amount: true,
      },
    });

    return {
      message: 'paltform revenue for this event',
      managerName: `${event.manager.firstname} ${event.manager.lastname}`,
      eventId,
      eventName: event.eventTitle,
      platformRevenue: revenue._sum?.amount || 0,
    };
  }

  async getEventWiseReport(eventId: number, userId: number) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId, managerId: userId },

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
        status: BookingStatus.Confirmed,
      },
    });

    const cancelledBookings = await this.prisma.booking.count({
      where: {
        eventId,
        status: BookingStatus.Cancelled,
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

        reason: TransactionReason.AdminShare,
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
    const soldSeats = totalBookings;
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
          (totalRevenue._sum.amount || 0) - (adminRevenue._sum.amount || 0),
      },
    };
  }
}
