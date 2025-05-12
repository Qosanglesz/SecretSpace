import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Place } from './entities/place.entity';
import { PlaceImage } from './entities/place-image.entity';
import { Comment } from './entities/comment.entity';
import { Rating } from './entities/rating.entity';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreateRatingDto } from './dto/create-rating.dto';


@Injectable()
export class PlacesService {
  constructor(
    @InjectRepository(Place) private readonly placeRepository: Repository<Place>,
    @InjectRepository(PlaceImage) private readonly placeImageRepository: Repository<PlaceImage>,
    @InjectRepository(Comment) private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Rating) private readonly ratingRepository: Repository<Rating>,
  ) {}

  async create(createPlaceDto: CreatePlaceDto, imageBuffers: Buffer[], userId: string): Promise<Place> {
    const place = this.placeRepository.create({
      ...createPlaceDto,
      user: { user_id: userId },
    });

    const savedPlace = await this.placeRepository.save(place);

    const imageEntities = imageBuffers.map(buffer => {
      return this.placeImageRepository.create({ image: buffer, place: savedPlace });
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

  async update(placeId: string, updatePlaceDto: UpdatePlaceDto, imageBuffers: Buffer[], userId: string): Promise<Place> {
    const place = await this.placeRepository.findOne({
      where: {
        place_id: placeId,
        user: { user_id: userId }
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
      await this.placeImageRepository.delete({ place: updatedPlace });

      // Add new images
      const imageEntities = imageBuffers.map(buffer => {
        return this.placeImageRepository.create({ image: buffer, place: updatedPlace });
      });

      await this.placeImageRepository.save(imageEntities);
    }

    // Fetch the updated place with images
    const placeWithImages = await this.placeRepository.findOne({
      where: { place_id: updatedPlace.place_id },
      relations: ['images'],
    });

    if (!placeWithImages) {
      throw new NotFoundException('Place not found after update');
    }

    return placeWithImages;
  }

// In places.service.ts or similar file
  async findNearby(latitude: number, longitude: number, distance: number = 0.5) {
    return this.placeRepository
      .createQueryBuilder('place')
      .leftJoinAndSelect('place.images', 'image')
      .leftJoinAndSelect('place.ratings', 'rating')
      .where(`6371 * acos(
            LEAST(1, GREATEST(-1, 
              cos(radians(:lat)) * cos(radians(place.latitude)) *
              cos(radians(place.longitude) - radians(:lng)) +
              sin(radians(:lat)) * sin(radians(place.latitude))
            ))
          ) < :distance`, {
        lat: latitude,
        lng: longitude,
        distance: distance
      })
      .getMany();
  }

  async findAll(userId: string): Promise<Place[]> {
    return this.placeRepository.find({
      where: { user: { user_id: userId } },
      relations: ['images', 'ratings']
    });
  }

  async findOne(id: string): Promise<Place> {
    const place = await this.placeRepository.findOne({
      where: { place_id: id },
      relations: ['images', 'comments', 'comments.user', 'ratings'],
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
        user: { user_id: userId }
      }
    });
    if (!place) {
      throw new NotFoundException('Place not found');
    }
    return this.placeRepository.remove(place);
  }

  // Comment related methods
  async createComment(createCommentDto: CreateCommentDto, userId: string): Promise<Comment> {
    const place = await this.placeRepository.findOne({
      where: { place_id: createCommentDto.place_id }
    });

    if (!place) {
      throw new NotFoundException('Place not found');
    }

    const comment = this.commentRepository.create({
      content: createCommentDto.content,
      place: { place_id: createCommentDto.place_id },
      user: { user_id: userId }
    });

    return this.commentRepository.save(comment);
  }

  async getCommentsByPlace(placeId: string): Promise<Comment[]> {
    const place = await this.placeRepository.findOne({
      where: { place_id: placeId }
    });

    if (!place) {
      throw new NotFoundException('Place not found');
    }

    return this.commentRepository.find({
      where: { place: { place_id: placeId } },
      relations: ['user', 'rating']
    });
  }

  // Rating related methods
  async createRating(createRatingDto: CreateRatingDto, userId: string): Promise<Rating> {
    const place = await this.placeRepository.findOne({
      where: { place_id: createRatingDto.place_id }
    });

    if (!place) {
      throw new NotFoundException('Place not found');
    }

    const comment = await this.commentRepository.findOne({
      where: { 
        comment_id: createRatingDto.comment_id,
        user: { user_id: userId }
      }
    });

    if (!comment) {
      throw new NotFoundException('Comment not found or you are not the author');
    }

    // Check if rating already exists for this comment
    const existingRating = await this.ratingRepository.findOne({
      where: { comment: { comment_id: createRatingDto.comment_id } }
    });

    if (existingRating) {
      throw new BadRequestException('Rating already exists for this comment');
    }

    const rating = this.ratingRepository.create({
      value: createRatingDto.value,
      place: { place_id: createRatingDto.place_id },
      comment: { comment_id: createRatingDto.comment_id }
    });

    return this.ratingRepository.save(rating);
  }

  async getAverageRatingByPlace(placeId: string): Promise<number> {
    const result = await this.ratingRepository
      .createQueryBuilder('rating')
      .select('AVG(rating.value)', 'average')
      .where('rating.place_id = :placeId', { placeId })
      .getRawOne();

    return result.average ? parseFloat(result.average) : 0;
  }

  async findImage(imageId: string): Promise<PlaceImage> {
    const image = await this.placeImageRepository.findOne({
      where: { id: imageId }
    });
    
    if (!image) {
      throw new NotFoundException(`Image with ID ${imageId} not found`);
    }
    
    return image;
  }
}