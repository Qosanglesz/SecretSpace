import {Injectable, InternalServerErrorException, NotFoundException} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {Place} from './entities/place.entity';
import {PlaceImage} from './entities/place-image.entity';
import {CreatePlaceDto} from './dto/create-place.dto';
import {NotFoundError} from "rxjs";

@Injectable()
export class PlacesService {
  constructor(
      @InjectRepository(Place) private readonly placeRepository: Repository<Place>,
      @InjectRepository(PlaceImage) private readonly placeImageRepository: Repository<PlaceImage>,
  ) {}

  async create(createPlaceDto: CreatePlaceDto, imageBuffers: Buffer[]): Promise<Place> {
    const place = this.placeRepository.create({
      ...createPlaceDto,
    });

    const savedPlace = await this.placeRepository.save(place);

    const imageEntities = imageBuffers.map(buffer => {
      return this.placeImageRepository.create({image: buffer, place: savedPlace});
    });

    await this.placeImageRepository.save(imageEntities);

    const placeWithImages = await this.placeRepository.findOne({
      where: { place_id: savedPlace.place_id },
      relations: ['images'],
    });

    if (!placeWithImages) {
      throw new NotFoundException('Place not found after creation');
    }

    return placeWithImages;
  }

  async findAll(): Promise<Place[]> {
    return this.placeRepository.find({ relations: ['images'] });
  }
}
