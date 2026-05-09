import { ApiProperty } from '@nestjs/swagger';
import { IsString,  IsNumber,  Min, IsDate, IsNotEmpty } from 'class-validator';


export class CreateEventDto {
  @ApiProperty({ example: 'Music Concert' })
  @IsString()
  name!: string;
@IsNotEmpty()
  @ApiProperty()
  @IsDate()
  date!:Date

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

@IsString()
  @IsNotEmpty()
  @ApiProperty({example:"kamla hall"})
  venue! :string

@IsString()
  @IsNotEmpty()
  @ApiProperty({example:"india"})
   country!: string

}