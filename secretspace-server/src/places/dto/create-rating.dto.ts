import { IsNotEmpty, IsNumber, IsUUID, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRatingDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(5)
  value: number;

  @IsNotEmpty()
  @IsUUID()
  place_id: string;

  @IsNotEmpty()
  @IsUUID()
  comment_id: string;
}