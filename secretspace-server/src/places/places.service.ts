import { Injectable } from '@nestjs/common';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import {InjectRepository} from "@nestjs/typeorm";
import {Place} from "./entities/place.entity";
import {Repository} from "typeorm";
import {CloudinaryService} from "../cloudinary/cloudinary.service";

@Injectable()
export class PlacesService {
  constructor(
      @InjectRepository(Place) private readonly placeRepository: Repository<Place>,
      private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(
      createPlaceDto: CreatePlaceDto,
      imageBuffer: Buffer | null,
  ): Promise<Place> {
    const place = this.placeRepository.create({
      ...createPlaceDto,
      image: imageBuffer,
    });

    return this.placeRepository.save(place);
  }
}
