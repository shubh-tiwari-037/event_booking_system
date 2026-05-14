import { Injectable } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { PrismaService } from 'src/prisma';
import { AuthenticatedRequest } from '@Common';
import { EventStatus } from 'src/generated/prisma/enums';


@Injectable()
export class EventService {
  constructor(private readonly prisma: PrismaService) {}

  async createEvent(createEventDto: CreateEventDto, req: AuthenticatedRequest) {
    const { name, maxTickets, date, ticketPrice, city, venue, country } = createEventDto;
    const managerId = req.user.id;
    // const eventDate = new Date(Date.now() + 7 * 24 * 60* 60 * 1000);
    

    try {
      
       const existeEvent = await this.prisma.event.findFirst({
      // where: { name, date: eventDate },
       where: { name, date },
    });

    if (existeEvent) {
      throw new Error('event alrady existe this date ');
    }

    const event = await this.prisma.event.create({
    data:{
        name,
        maxTickets,
        // date: eventDate,
         date,
        ticketPrice,
        managerId,
        city,
        country,
        venue
      },
    });

    return {message :"event created successfully"}

    } catch (error) {
      console.log("ERROR WHILE CREATING EVENT",error)
    }

   
  }


 async allEvents() {
  const events = await this.prisma.event.findMany({
    orderBy: {
      date: 'asc', 
    },
  });

  return events;
}



 async eventById(id: number) {
  const event = await this.prisma.event.findUnique({
    where: { id },
  });

  if (!event) {
    throw new Error('Event not found');
  }

  return event;
}


  async updateEvent(id: number, updateEventDto: UpdateEventDto) {
  //  const {name, date} = updateEventDto

  console.log(id);

   const event = await this.prisma.event.findUnique({
    where:{
      id,
    }
   })

     if(!event){
      throw new Error("event not found")
  }

  const updated = await this.prisma.event.update({
    where:{
      id,
    },
    data:{
      ...updateEventDto
    }
  })
return {message:"evented updated successfully"}  

};


async eventRemove(id: number) {
 
  const event = await this.prisma.event.findUnique({
    where: { id },
  });

  if (!event) {
    throw new Error('Event not found');
  }

 
  await this.prisma.event.delete({
    where: { id },
  });

  return {
    message: 'Event deleted successfully',
  };
}


async setStatus(id:number, status:EventStatus){

  const event = await this.prisma.event.findFirst({
    where:{id},

  })

  if(!event){
    throw new Error("event is not found")
  }

  await this.prisma.event.update({
    where:{id},
    data:{
      status
    }
  })
  return {message:"status changed successfully"}
}

}
