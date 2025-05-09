import {Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {Place} from './entities/place.entity';
import {PlaceImage} from './entities/place-image.entity';
import {CreatePlaceDto} from './dto/create-place.dto';
import {UpdatePlaceDto} from './dto/update-place.dto';

@Injectable()
export class PlacesService {
    constructor(
        @InjectRepository(Place) private readonly placeRepository: Repository<Place>,
        @InjectRepository(PlaceImage) private readonly placeImageRepository: Repository<PlaceImage>,
    ) {
    }

    async create(createPlaceDto: CreatePlaceDto, imageBuffers: Buffer[], userId: string): Promise<Place> {
        const place = this.placeRepository.create({
            ...createPlaceDto,
            user: {user_id: userId},
        });

        const savedPlace = await this.placeRepository.save(place);

        const imageEntities = imageBuffers.map(buffer => {
            return this.placeImageRepository.create({image: buffer, place: savedPlace});
        });

        await this.placeImageRepository.save(imageEntities);

        const placeWithImages = await this.placeRepository.findOne({
            where: {place_id: savedPlace.place_id},
            relations: ['images'],
        });

        if (!placeWithImages) {
            throw new NotFoundException('Place not found after creation');
        }

        return placeWithImages;
    }

    async update(placeId: string, updatePlaceDto: UpdatePlaceDto, imageBuffers: Buffer[], userId: string): Promise<Place> {
        const place = await this.placeRepository.findOne({
            where: {
                place_id: placeId,
                user: {user_id: userId}
            },
            relations: ['images'],
        });

        if (!place) {
            throw new NotFoundException('Place not found');
        }

        // Update place details
        Object.assign(place, updatePlaceDto);

        const updatedPlace = await this.placeRepository.save(place);

        // Handle image updates
        if (imageBuffers.length > 0) {
            // Remove existing images first
            await this.placeImageRepository.delete({place: updatedPlace});

            // Add new images
            const imageEntities = imageBuffers.map(buffer => {
                return this.placeImageRepository.create({image: buffer, place: updatedPlace});
            });

            await this.placeImageRepository.save(imageEntities);
        }

        // Fetch the updated place with images
        const placeWithImages = await this.placeRepository.findOne({
            where: {place_id: updatedPlace.place_id},
            relations: ['images'],
        });

        if (!placeWithImages) {
            throw new NotFoundException('Place not found after update');
        }

        return placeWithImages;
    }

    async findNearby(lat: number, lng: number, radiusKm: number): Promise<Place[]> {
        const earthRadius = 6371; // Earth radius in kilometers

        return this.placeRepository
            .createQueryBuilder('place')
            .leftJoinAndSelect('place.images', 'image')
            .where(`
      ${earthRadius} * acos(
        cos(radians(:lat)) * cos(radians(place.latitude)) *
        cos(radians(place.longitude) - radians(:lng)) +
        sin(radians(:lat)) * sin(radians(place.latitude))
      ) < :radius
    `, {lat, lng, radius: radiusKm})
            .getMany();
    }


    async findAll(userId: string): Promise<Place[]> {
        return this.placeRepository.find({
            where: {user: {user_id: userId}},
            relations: ['images']
        });
    }

    async findOne(id: string): Promise<Place> {
        const place = await this.placeRepository.findOne({
            where: {place_id: id},
            relations: ['images'],
        });
        if (!place) {
            throw new NotFoundException('Place not found');
        }
        return place;
    }

    async deleted(id: string, userId: string): Promise<Place> {
        const place = await this.placeRepository.findOne({
          where: {
            place_id: id,
            user: {user_id: userId}
          }
        })
      if (!place) {
        throw new NotFoundException('Place not found');
      }
        return this.placeRepository.remove(place);
    }
}
