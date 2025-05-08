import {
  Controller,
  Post,
  Body,
  UploadedFiles,
  UseInterceptors
} from '@nestjs/common';
import { PlacesService } from './places.service';
import { CreatePlaceDto } from './dto/create-place.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller('places')
export class PlacesController {
  constructor(private readonly placesService: PlacesService) {}

  @Post()
  @UseInterceptors(
      FileFieldsInterceptor([{ name: 'images', maxCount: 1 }]) // รับแค่ 1 ภาพ หากต้องการหลายภาพต้องจัดการเพิ่ม
  )
  async create(
      @Body() createPlaceDto: CreatePlaceDto,
      @UploadedFiles() files: { images?: Express.Multer.File[] },
  ) {
    const imageBuffer = files.images?.[0]?.buffer || null;
    return this.placesService.create(createPlaceDto, imageBuffer);
  }
}
