import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  ParseIntPipe,
  ParseEnumPipe,
  Query,
} from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import {
  AuthenticatedRequest,
  JwtAuthGuard,
  Roles,
  RolesGuard,
  UserType,
} from '@Common';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

import { ApiParam } from '@nestjs/swagger';
import { EventStatus } from 'src/generated/prisma/enums';
import { GetEventsRequestDto } from './dto/get-event.dto';

@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserType.Manager)
  @Post('create')
  createEvent(
    @Body() createEventDto: CreateEventDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.eventService.createEvent(createEventDto, req);
  }

  
@Get()
async allEvents(@Query() query: GetEventsRequestDto) {
  return await this.eventService.allEvents({
    page: Number(query.page) || 1,
    limit: Number(query.limit) || 10,
    search: query.search || '',
  });
}

  @Get(':id')
  eventById(@Param('id', ParseIntPipe) id: number) {
    return this.eventService.eventById(id);
  }

  // working api
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserType.Manager)
  @Patch(':id')
  updateEvent(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    return this.eventService.updateEvent(id, updateEventDto);
  }

  // working
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserType.Manager)
  @Delete(':id')
  eventRemove(@Param('id', ParseIntPipe) id: number) {
    return this.eventService.eventRemove(id);
  }

  @ApiParam({ name: 'status', enum: EventStatus })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserType.Manager)
  @Patch('status/:id/:status')
  setStatus(
    @Param('id', ParseIntPipe) id: number,
    @Param('status', new ParseEnumPipe(EventStatus)) status: EventStatus,
  ) {
    return this.eventService.setStatus(id, status);
  }
}
