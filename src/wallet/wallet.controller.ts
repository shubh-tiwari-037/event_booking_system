import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { WalletService } from './wallet.service';

import { DepositBalanceDto } from './dto/deposit-balance.dto';
import {
  AuthenticatedRequest,
  JwtAuthGuard,
  Roles,
  RolesGuard,
  UserType,
} from '@Common';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  // CHECK balance for user
  // @Roles(UserType.User)
  @Get('balance')
  checkBalance(@Req() req: AuthenticatedRequest) {
    return this.walletService.checkBalance(req.user.id, req.user.type);
  }

  // add balancr to wallet
  // @Roles(UserType.User)
  @Patch('deposit')
  depositBalance(
    @Req() req: AuthenticatedRequest,
    @Body() dto: DepositBalanceDto,
  ) {
    return this.walletService.depositBalance(req.user.id, dto.amount, req.user.type);
  }

  // TRANSACTION  history based on role
  @Get('transactions')
  getTransactions(@Req() req: AuthenticatedRequest) {
    return this.walletService.getTransactions(req.user.id, req.user.type);
  }
}
