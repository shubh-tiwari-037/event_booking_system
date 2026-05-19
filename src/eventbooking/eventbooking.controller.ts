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
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { EventbookingService } from './eventbooking.service';
import { CreateEventbookingDto } from './dto/create-eventbooking.dto';

import {
  AuthenticatedRequest,
  JwtAuthGuard,
  Roles,
  RolesGuard,
  UserType,
} from '@Common';
import { ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { CreateSeatHoldDto } from './dto/create-seat-hold.dto';

@Controller('booking')
export class EventbookingController {
  constructor(private readonly eventbookingService: EventbookingService) {}

  //    @UseGuards(JwtAuthGuard)
  //   @ApiBearerAuth()
  //   @Post()
  //   createBooking(
  //     @Body() createEventbookingDto: CreateEventbookingDto,
  //     @Param()
  //     @Req() req:any
  //   ) {
  //     const userId = req.user.id
  //     return this.eventbookingService.createBooking(createEventbookingDto, userId);
  //   }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.Admin, UserType.Manager)
  @ApiBearerAuth()
  @Get()
  getAllBookings(@Query('page') page: string) {
    return this.eventbookingService.getAllBookings(Number(page) || 1);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getMyBookings(@Req() req: any) {
    return this.eventbookingService.getUserBookings(req.user.id);
  }

  @Post('hold')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  holdSeat(
    @Body() createSeatHoldDto: CreateSeatHoldDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.eventbookingService.holdSeat(
      req.user.id,
      createSeatHoldDto.eventId,
      createSeatHoldDto.quantity,
    );
  }

  @Post('confirm/:holdId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiParam({
    name: 'holdId',
  })
  confirmBooking(
    @Param('holdId', ParseIntPipe)
    holdId: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.eventbookingService.createBooking(req.user.id, holdId);
  }
}
