import { UserType } from '@Common';
import { Injectable } from '@nestjs/common';
import { TransactionReason, TransactionType } from 'src/generated/prisma/enums';
import { PrismaService } from 'src/prisma';

@Injectable()
export class WalletService {
  constructor(private readonly prisma: PrismaService) {}
  // check balance for user and manager
  async checkBalance(userId: number) {
    const wallet = await this.prisma.wallet.findUnique({
      where: {
        userId,
      },
    });

    if (!wallet) {
      throw new Error('Wallet not found');
    }

    return {
      balance: wallet.balance,
    };
  }

  // add balance 
  async depositBalance(userId: number, amount: number) {
    if (amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    const wallet = await this.prisma.wallet.findUnique({
      where: {
        userId,
      },
    });

    if (!wallet) {
      throw new Error('Wallet not found');
    }

    // update wallet agar wallet mil gaya h to

    const updatedWallet = await this.prisma.wallet.update({
      where: {
        id: wallet.id,
      },

      data: {
        balance: {
          increment: amount,
        },
      },
    });

    // transaction history
    await this.prisma.transaction.create({
      data: {
        userId,
        amount,
        type: TransactionType.CREDIT,
        reason: TransactionReason.ADD_BALANCE,
      },
    });

    return {
      message: 'Balance deposited successfully',

      balance: updatedWallet.balance,
    };
  }

  // see transicaion based on role and id
  async getTransactions(id: number, role: string) {
    // ADMIN
    if (role === UserType.Admin) {
      return await this.prisma.adminTransaction.findMany({
        where: {
          adminId: id,
        },

        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    // MANAGER
    if (role === UserType.Manager || role === UserType.User) {
      return this.prisma.transaction.findMany({
        where: {
          userId: id,
        },

        orderBy: {
          createdAt: 'desc',
        },
      });
    }
  }
}
