import { PartialType } from '@nestjs/mapped-types';
import { CreateEventbookingDto } from './create-eventbooking.dto';

export class UpdateEventbookingDto extends PartialType(CreateEventbookingDto) {}
