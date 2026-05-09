import { UserType } from '@Common';
import { Injectable } from '@nestjs/common';
import { TransactionReason, TransactionType } from 'src/generated/prisma/enums';
import { PrismaService } from 'src/prisma';


@Injectable()
export class ReportService {
  
constructor(private readonly prisma:PrismaService){}

async adminReportData(){
  return this.prisma.$transaction(async(tx)=>{

    const totalUsers= await tx.user.count({
      where:{role:'USER'}
    });

     const totalManager= await tx.user.count({
      where:{role:'MANAGER'}
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
        where:{
          reason: TransactionReason.MANAGER_SHARE
        },

        _sum:{
          amount:true
        }
      });


 const adminShare = await tx.adminTransaction.aggregate({
        where:{
          reason: TransactionReason.ADMIN_SHARE
        },

        _sum:{
          amount:true
        }
      });


      const adminRevenue =adminShare._sum.amount || 0;
const managerRevenue =managerShare._sum.amount || 0;
const totalRevenue =adminRevenue + managerRevenue;

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


}};


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

const managerShare=managerRevenue._sum.amount || 0
  
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
          manager:managerShare,
        },

      },
    };
    });
  }



}
