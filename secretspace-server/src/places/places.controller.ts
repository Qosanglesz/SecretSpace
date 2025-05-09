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
  Put, Query, UseGuards, Req,
} from '@nestjs/common';
import { PlacesService } from './places.service';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto'; // Import the UpdatePlaceDto
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Place } from './entities/place.entity';
import {AuthGuard} from "@nestjs/passport";

@Controller('places')
export class PlacesController {
  constructor(private readonly placesService: PlacesService) {}

  @Post()
  @UseInterceptors(FileFieldsInterceptor([{ name: 'images', maxCount: 5 }]))
  @UseGuards(AuthGuard('jwt'))
  async create(
      @Body() createPlaceDto: CreatePlaceDto,
      @UploadedFiles() files: { images?: Express.Multer.File[] },
      @Req() req: { user: { userId: string; } },
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
      @Req() req: { user: { userId: string; } },
  ): Promise<Place> {
    const imageBuffers = files.images?.map(f => f.buffer) || [];
    return this.placesService.update(placeId, updatePlaceDto, imageBuffers, req.user.userId);
  }

  @Get('nearby')
  async findNearby(
      @Query('lat') lat: string,
      @Query('lng') lng: string,
      @Query('radius') radius = '0.5', // radius in kilometers
      @Req() req: { user: { userId: string; } },
  ): Promise<Place[]> {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusKm = parseFloat(radius);

    return this.placesService.findNearby(latitude, longitude, radiusKm);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async findAll(@Req() req: { user: { userId: string; } }): Promise<Place[]> {
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
      @Req() req: { user: { userId: string; } }
  ): Promise<Place> {
    return this.placesService.deleted(id, req.user.userId);
  }
}
