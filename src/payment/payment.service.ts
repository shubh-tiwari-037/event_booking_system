
import { Injectable } from '@nestjs/common';
import { TransactionReason, TransactionType } from 'src/generated/prisma/enums';
import { PrismaService } from 'src/prisma';
import { Prisma } from '@prisma/client';



@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  async processBookingPayment(
    tx: Prisma.TransactionClient,
    booking: any,
    event: any,
    userId: number,
    totalPrice: number,
  ) {

    const ADMIN_PERCENTAGE = 18.8;
    const MANAGER_PERCENTAGE = 81.2;

    const adminShare =(totalPrice * ADMIN_PERCENTAGE) / 100;
    const managerShare =(totalPrice * MANAGER_PERCENTAGE) / 100;

    const admin = await tx.admin.findFirst({});

    if (!admin) {
      throw new Error('Admin not found');
    }

    const adminWallet =await tx.adminWallet.findUnique({
        where: {
          adminId: admin.id,
        },
      });

    const managerWallet =await tx.wallet.findUnique({
        where: {
          userId: event.managerId,
        },
      });

    if (!adminWallet || !managerWallet) {
      throw new Error('Wallet not found');
    }

    await tx.wallet.update({
      where: {
        userId,
      },
      data: {
        balance: {
          decrement: totalPrice,
        },
      },
    });

    await tx.adminWallet .update({
      where: {
        adminId: admin.id,
      },
      data: {
        balance: {
          increment: adminShare,
        },
      },
    });

    await tx.wallet.update({
      where: {
        userId: event.managerId,
      },
      data: {
        balance: {
          increment: managerShare,
        },
      },
    });

    await tx.transaction.create({
      data: {
        userId,
        amount: totalPrice,
        type: TransactionType.Debit,
        reason:
          TransactionReason.TicketPurchase,
        referenceId: booking.id,
      },
    });

    await tx.adminTransaction.create({
      data: {
        adminId: admin.id,
        amount: adminShare,
        type: TransactionType.Credit,
        reason:
          TransactionReason.AdminShare,
        referenceId: booking.id,
      },
    });

    await tx.transaction.create({
      data: {
        userId: event.managerId,
        amount: managerShare,
        type: TransactionType.Credit,
        reason:
          TransactionReason.ManagerShare,
        referenceId: booking.id,
      },
    });
  }


}




