import { IsNotEmpty, IsString, IsNumber } from 'class-validator';
import {Type} from "class-transformer";

export class CreatePlaceDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    description: string;

    @IsNotEmpty()
    @Type(() => Number)
    @IsNumber()
    latitude: number;

    @IsNotEmpty()
    @Type(() => Number)
    @IsNumber()
    longitude: number;
}
