import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  Min,
} from 'class-validator';

export class CreateSeatHoldDto {

  @ApiProperty({
  
    required: true,
  })
  @IsInt()
  @IsNotEmpty()
  eventId!: number;

  @ApiProperty({
    required: true,
  })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  quantity!: number;
}