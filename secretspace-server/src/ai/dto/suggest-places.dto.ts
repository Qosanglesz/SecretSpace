// src/ai/dto/suggest-places.dto.ts
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class SuggestPlacesDto {
  @IsNotEmpty()
  @IsString()
  lat: string;

  @IsNotEmpty()
  @IsString()
  lng: string;

  @IsOptional()
  @IsString()
  preferences?: string;
}