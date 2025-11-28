import {
  IsString,
  IsOptional,
  IsNumber,
  IsObject,
  MaxLength,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EventName } from '../../insights/dto/event-schema';

export class TrackEventDto {
  @IsEnum(EventName)
  name: EventName;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  userId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  sessionId?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  ts?: number;

  @IsOptional()
  @IsObject()
  properties?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  context?: Record<string, unknown>;
}
