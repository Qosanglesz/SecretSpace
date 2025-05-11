import { Module } from '@nestjs/common';
import { PlacesService } from './places.service';
import { PlacesController } from './places.controller';
import { TypeOrmModule } from "@nestjs/typeorm";
import { Place } from "./entities/place.entity";
import { Rating } from "./entities/rating.entity";
import { Comment } from "./entities/comment.entity";
import { CloudinaryService } from "../cloudinary/cloudinary.service";
import { PlaceImage } from "./entities/place-image.entity";

@Module({
  imports: [TypeOrmModule.forFeature([
    Place,
    Rating,
    Comment,
    PlaceImage,
  ])],
  controllers: [PlacesController],
  providers: [PlacesService, CloudinaryService],
})
export class PlacesModule {}