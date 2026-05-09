import { ApiProperty } from '@nestjs/swagger';

import {
  IsNotEmpty,
  IsNumber,
  Min,
} from 'class-validator';

export class DepositBalanceDto {

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  amount!: number;
}