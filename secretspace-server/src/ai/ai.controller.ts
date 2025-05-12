// src/ai/ai.controller.ts
import { Controller, Get, Post, Body, Query, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { AiService } from './ai.service';
import { AuthGuard } from '@nestjs/passport';
import { SuggestPlacesDto } from './dto/suggest-places.dto';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('suggest-places')
  @UseGuards(AuthGuard('jwt'))
  async suggestQuietPlaces(
    @Query() suggestPlacesDto: SuggestPlacesDto,
    @Req() req : { user: { userId: string } }
  ) {
    const latitude = parseFloat(suggestPlacesDto.lat);
    const longitude = parseFloat(suggestPlacesDto.lng);
    
    if (isNaN(latitude) || isNaN(longitude)) {
      throw new BadRequestException('Invalid coordinates');
    }
    
    // Log the coordinates for debugging
    // console.log(`Requesting AI suggestions for coordinates: ${latitude}, ${longitude}`);
    
    const suggestions = await this.aiService.suggestQuietPlaces(
      latitude, 
      longitude, 
      suggestPlacesDto.preferences
    );
    
    // Log the response structure for debugging
    // console.log(`Got ${suggestions.places?.length || 0} suggestions`);
    if (suggestions.places && suggestions.places.length > 0) {
      const firstPlace = suggestions.places[0];
    //   console.log('First place structure:', {
    //     name: firstPlace.name,
    //     hasMapImage: !!firstPlace.mapImage,
    //     photoUrlsCount: firstPlace.photoUrls?.length || 0,
    //     photosCount: firstPlace.photos?.length || 0
    //   });
    }
    
    return suggestions;
  }

  // Add a debug endpoint to check coordinates
  @Get('check-location')
  async checkLocation(
    @Query('lat') lat: string,
    @Query('lng') lng: string
  ) {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    
    // console.log(`Checking location: ${latitude}, ${longitude}`);
    
    const isInThailand = this.aiService.checkIfInThailand(latitude, longitude);
    return {
      coordinates: { latitude, longitude },
      isInThailand: isInThailand,
      message: isInThailand 
        ? 'These coordinates are within Thailand boundaries' 
        : 'These coordinates are outside Thailand boundaries'
    };
  }

  @Post('add-place')
  @UseGuards(AuthGuard('jwt'))
  async addAiSuggestedPlace(
    @Body() placeData: any,
    @Req() req: { user: { userId: string } }
  ) {
    // console.log('Adding AI suggested place:', {
    //   name: placeData.name,
    //   hasMapImage: !!placeData.mapImage,
    //   photoUrlsCount: placeData.photoUrls?.length || 0,
    //   photosCount: placeData.photos?.length || 0
    // });
    
    return this.aiService.addAiSuggestedPlace(placeData, req.user.userId);
  }
  
}