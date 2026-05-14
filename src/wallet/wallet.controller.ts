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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
@ApiTags(' WALLET Admin & User')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

 
  @Get('balance')
  checkBalance(@Req() req: AuthenticatedRequest) {
    return this.walletService.checkBalance(req.user.id, req.user.type);
  }

 
  @Patch('deposit')
  depositBalance(
    @Req() req: AuthenticatedRequest,
    @Body() dto: DepositBalanceDto,
  ) {
    return this.walletService.depositBalance(req.user.id, dto.amount, req.user.type);
  }

  @Get('transactions')
  getTransactions(@Req() req: AuthenticatedRequest) {
    return this.walletService.getTransactions(req.user.id, req.user.type);
  }
}
