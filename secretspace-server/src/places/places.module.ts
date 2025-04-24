import { Module } from '@nestjs/common';
import { PlacesService } from './places.service';
import { PlacesController } from './places.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Place} from "./entities/place.entity";
import {Rating} from "./entities/rating.entity";
import {Comment} from "./entities/comment.entity";

@Module({
  imports: [TypeOrmModule.forFeature([
      Place,
      Rating,
      Comment,
  ])],
  controllers: [PlacesController],
  providers: [PlacesService],
})
export class PlacesModule {}
