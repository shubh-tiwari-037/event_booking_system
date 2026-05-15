import { ApiProperty } from '@nestjs/swagger';
import { IsString,  IsNumber,  Min, IsDate, IsNotEmpty, IsOptional } from 'class-validator';


export class CreateEventDto {
  @ApiProperty({ example: 'Music Concert' })
  @IsString()
  eventTitle!: string;

  @ApiProperty({ default: 'Kapil Sharma'})
  @IsOptional()
  @IsString()
  performer?: string;

@IsNotEmpty()
  @ApiProperty()
  @IsDate()
  date!:Date


  @ApiProperty()
  @IsDate()
  startTime!: Date;

  @ApiProperty()
  @IsDate()
  endTime!: Date;

  @ApiProperty({ example: 499.99 })
  @IsNumber()
  @Min(0)
  ticketPrice!: number;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  maxTickets!: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({example:"bhopal"})
  city!: string

   @ApiProperty({default: 'MP Nagar Zone-2, Bhopal',})
  @IsOptional()
  @IsString()
  address?: string;

  
    @ApiProperty({
    default: 'Madhya Pradesh',
  })
  @IsOptional()
  @IsString()
  state?: string;


@IsString()
  @IsNotEmpty()
  @ApiProperty({example:"kamla hall"})
  venue! :string

@IsString()
  @IsNotEmpty()
  @ApiProperty({example:"india"})
   country!: string

}