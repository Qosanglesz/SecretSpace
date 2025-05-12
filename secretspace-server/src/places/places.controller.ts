import {
  Controller,
  Post,
  Body,
  UploadedFiles,
  UseInterceptors,
  Get,
  Param,
  Delete,
  ParseUUIDPipe,
  Put,
  Query,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { PlacesService } from './places.service';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreateRatingDto } from './dto/create-rating.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Place } from './entities/place.entity';
import { Comment } from './entities/comment.entity';
import { Rating } from './entities/rating.entity';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';


@Controller('places')
export class PlacesController {
  constructor(private readonly placesService: PlacesService) {}

  @Post()
  @UseInterceptors(FileFieldsInterceptor([{ name: 'images', maxCount: 5 }]))
  @UseGuards(AuthGuard('jwt'))
  async create(
    @Body() createPlaceDto: CreatePlaceDto,
    @UploadedFiles() files: { images?: Express.Multer.File[] },
    @Req() req: { user: { userId: string } },
  ): Promise<Place> {
    const imageBuffers = files.images?.map(f => f.buffer) || [];
    return this.placesService.create(createPlaceDto, imageBuffers, req.user.userId);
  }

  @Put(':placeId')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'images', maxCount: 5 }]))
  @UseGuards(AuthGuard('jwt'))
  async update(
    @Param('placeId', ParseUUIDPipe) placeId: string,
    @Body() updatePlaceDto: UpdatePlaceDto,
    @UploadedFiles() files: { images?: Express.Multer.File[] },
    @Req() req: { user: { userId: string } },
  ): Promise<Place> {
    const imageBuffers = files.images?.map(f => f.buffer) || [];
    return this.placesService.update(placeId, updatePlaceDto, imageBuffers, req.user.userId);
  }

  @Get('nearby')
  async findNearby(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radius') radius = '0.5', // radius in kilometers
  ): Promise<Place[]> {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusKm = parseFloat(radius);

    return this.placesService.findNearby(latitude, longitude, radiusKm);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async findAll(@Req() req: { user: { userId: string } }): Promise<Place[]> {
    return this.placesService.findAll(req.user.userId);
  }

  @Get(':placeId')
  async findById(@Param('placeId', ParseUUIDPipe) placeId: string): Promise<Place> {
    return this.placesService.findOne(placeId);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: { user: { userId: string } }
  ): Promise<Place> {
    return this.placesService.deleted(id, req.user.userId);
  }

  // Comment endpoints
  @Post('comments')
  @UseGuards(AuthGuard('jwt'))
  async createComment(
    @Body() createCommentDto: CreateCommentDto,
    @Req() req: { user: { userId: string } }
  ): Promise<Comment> {
    return this.placesService.createComment(createCommentDto, req.user.userId);
  }

  @Get(':placeId/comments')
  async getCommentsByPlace(
    @Param('placeId', ParseUUIDPipe) placeId: string
  ): Promise<Comment[]> {
    return this.placesService.getCommentsByPlace(placeId);
  }

  // Rating endpoints
  @Post('ratings')
  @UseGuards(AuthGuard('jwt'))
  async createRating(
    @Body() createRatingDto: CreateRatingDto,
    @Req() req: { user: { userId: string } }
  ): Promise<Rating> {
    return this.placesService.createRating(createRatingDto, req.user.userId);
  }

  @Get(':placeId/rating')
  async getAverageRating(
    @Param('placeId', ParseUUIDPipe) placeId: string
  ): Promise<{ average: number }> {
    const average = await this.placesService.getAverageRatingByPlace(placeId);
    return { average };
  }

  @Get('images/:imageId')
  async getImage(
    @Param('imageId') imageId: string,
    @Res() res: Response
  ): Promise<any> {
    const image = await this.placesService.findImage(imageId);
    
    // Set appropriate content type
    res.set('Content-Type', 'image/jpeg');
    // Send the binary data directly
    return res.send(image.image);
  }
  
}