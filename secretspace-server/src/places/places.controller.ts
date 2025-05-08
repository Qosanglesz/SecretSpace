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
  Put, Query,
} from '@nestjs/common';
import { PlacesService } from './places.service';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto'; // Import the UpdatePlaceDto
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Place } from './entities/place.entity';

@Controller('places')
export class PlacesController {
  constructor(private readonly placesService: PlacesService) {}

  @Post()
  @UseInterceptors(FileFieldsInterceptor([{ name: 'images', maxCount: 5 }]))
  async create(
      @Body() createPlaceDto: CreatePlaceDto,
      @UploadedFiles() files: { images?: Express.Multer.File[] },
  ): Promise<Place> {
    const imageBuffers = files.images?.map(f => f.buffer) || [];
    return this.placesService.create(createPlaceDto, imageBuffers);
  }

  @Put(':placeId')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'images', maxCount: 5 }]))
  async update(
      @Param('placeId', ParseUUIDPipe) placeId: string,
      @Body() updatePlaceDto: UpdatePlaceDto,
      @UploadedFiles() files: { images?: Express.Multer.File[] },
  ): Promise<Place> {
    const imageBuffers = files.images?.map(f => f.buffer) || [];
    return this.placesService.update(placeId, updatePlaceDto, imageBuffers);
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
  async findAll(): Promise<Place[]> {
    return this.placesService.findAll();
  }

  @Get(':placeId')
  async findById(@Param('placeId', ParseUUIDPipe) placeId: string): Promise<Place> {
    return this.placesService.findOne(placeId);
  }

  @Delete(':id')
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<Place> {
    return this.placesService.deleted(id);
  }
}
