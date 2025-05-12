// src/ai/ai.service.ts
import { Injectable, HttpException, NotFoundException } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { PlacesService } from '../places/places.service';
import { CreatePlaceDto } from '../places/dto/create-place.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AiService {
  private apiKey: string | undefined;
  private googleApiKey: string | undefined;
  
  // Thailand's boundaries with a buffer zone
  private readonly THAILAND_BOUNDS = {
    north: 21.0,
    south: 5.0,
    west: 97.0,
    east: 106.0
  };
  
  constructor(
    private configService: ConfigService,
    private placesService: PlacesService,
    private httpService: HttpService,
  ) {
    this.apiKey = this.configService.get<string>('DEEPSEEK_API_KEY');
    if (!this.apiKey) {
      console.error('DEEPSEEK_API_KEY is not defined in environment variables');
      throw new Error('DEEPSEEK_API_KEY is required');
    }
    
    this.googleApiKey = this.configService.get<string>('GOOGLE_MAPS_API_KEY');
    if (!this.googleApiKey) {
      console.warn('GOOGLE_MAPS_API_KEY is not defined. Map and image features will be disabled.');
    }
  }

  // Public method for the debug endpoint
  public checkIfInThailand(latitude: number, longitude: number): boolean {
    return this.isInThailand(latitude, longitude);
  }

  async suggestQuietPlaces(latitude: number, longitude: number, userPreferences?: string): Promise<any> {
    try {
      // Log the coordinates for debugging
    //   console.log(`Processing coordinates in service: ${latitude}, ${longitude}`)
      
      // Check if coordinates are valid numbers
      if (isNaN(latitude) || isNaN(longitude)) {
        console.error('Invalid coordinates:', { latitude, longitude });
        throw new HttpException('Invalid coordinates. Please provide valid latitude and longitude.', 400);
      }
      
      // Check if these are the emulator's default coordinates
      const isEmulatorDefault = 
        Math.abs(latitude - 37.4220936) < 0.001 && 
        Math.abs(longitude - (-122.083922)) < 0.001;
      
      // If these are the emulator default coordinates, use Bangkok instead
      if (isEmulatorDefault) {
        // console.log('Detected emulator default coordinates. Using Bangkok coordinates instead.');
        latitude = 13.7563;
        longitude = 100.5018;
      }
      
      // Now check if in Thailand with the possibly updated coordinates
      if (!this.isInThailand(latitude, longitude)) {
        console.warn(`Warning: Coordinates (${latitude}, ${longitude}) appear to be outside Thailand's boundaries.`);
        // For development, use Bangkok coordinates as a fallback
        // console.log('Using Bangkok coordinates as fallback.');
        latitude = 13.7563;
        longitude = 100.5018;
      }
      
      // Get location context
      const locationContext = `coordinates (${latitude}, ${longitude}) in Thailand`;
    //   console.log(`Using location context: ${locationContext}`);
      
      // Create prompt for the AI
      const prompt = this.createPrompt(locationContext, userPreferences);
      
      // Call DeepSeek API
    //   console.log('Calling DeepSeek API...');
      const response = await axios.post(
        'https://api.deepseek.com/v1/chat/completions',
        {
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: 'You are an AI assistant that helps find quiet places in Thailand for studying, working, or focusing. Provide specific locations with detailed information including Thai name (if applicable), English name, description, exact coordinates, and why it might be a good quiet space. Only suggest places in Thailand.'
            },
            { role: 'user', content: prompt }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.7,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );
    //   console.log('Received response from DeepSeek API');

      // Parse the AI response
      const suggestedPlaces = this.parseAiResponse(response.data.choices[0].message.content);
    //   console.log(`Parsed ${suggestedPlaces.places?.length || 0} suggested places`);
      
      // Enhance places with images and maps
      const enhancedPlaces = await Promise.all(
        suggestedPlaces.places.map(async (place) => {
          const placeLatitude = parseFloat(place.latitude);
          const placeLongitude = parseFloat(place.longitude);
          
          // Get static map image
          const mapImage = this.getStaticMapUrl(placeLatitude, placeLongitude);
          
          // Get place photos as buffers
          const photoBuffers = await this.getPlaceImages(place.name, placeLatitude, placeLongitude);
          
          // For API response, convert buffers to base64 strings
          const photos = photoBuffers.map(buffer => 
            `data:image/jpeg;base64,${buffer.toString('base64')}`
          );
          
          return {
            ...place,
            mapImage,
            photos,
            photoBuffers // Include the raw buffers for saving to DB later
          };
        })
      );
      
      return {
        places: enhancedPlaces
      };
    } catch (error) {
      console.error('AI suggestion error:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(`Failed to get AI suggestions: ${error.message}`, 500);
    }
  }

  // Check if coordinates are within Thailand's approximate boundaries
  private isInThailand(latitude: number, longitude: number): boolean {
    // Log the check for debugging
    // console.log(`Checking if coordinates (${latitude}, ${longitude}) are in Thailand`);
    // console.log(`Thailand bounds: N:${this.THAILAND_BOUNDS.north}, S:${this.THAILAND_BOUNDS.south}, W:${this.THAILAND_BOUNDS.west}, E:${this.THAILAND_BOUNDS.east}`);
    
    const result = (
      latitude >= this.THAILAND_BOUNDS.south && 
      latitude <= this.THAILAND_BOUNDS.north && 
      longitude >= this.THAILAND_BOUNDS.west && 
      longitude <= this.THAILAND_BOUNDS.east
    );
    
    // console.log(`Result of Thailand check: ${result}`);
    return result;
  }

  private async getLocationContext(latitude: number, longitude: number): Promise<string> {
    // Simply return the coordinates for reliability
    return `coordinates (${latitude}, ${longitude}) in Thailand`;
  }

  private createPrompt(locationContext: string, userPreferences?: string): string {
    return `
      I'm looking for quiet places to study or work near ${locationContext}.
      ${userPreferences ? `I prefer places that are: ${userPreferences}` : ''}
      
      Please suggest 3-5 potential quiet places that might exist in this area. Focus on places that are actually in Thailand and would be suitable for Thai students or workers.
      
      For each place, provide:
      1. Name (in English and Thai if applicable)
      2. Description (why it's good for quiet work/study)
      3. Exact latitude and longitude (must be within Thailand's borders)
      4. Type of place (library, cafe, co-working space, university area, etc.)
      5. Potential amenities (wifi, power outlets, air conditioning, etc.)
      
      Format your response as a JSON object with an array of places. Example format:
      {
        "places": [
          {
            "name": "Place Name",
            "thai_name": "ชื่อสถานที่ (if applicable)",
            "description": "Detailed description",
            "latitude": "13.xxxx",
            "longitude": "100.xxxx",
            "type": "Type of place",
            "amenities": "Available amenities"
          }
        ]
      }
    `;
  }

  private async getPhotoUrlsForPlace(placeName: string, latitude: number, longitude: number): Promise<string[]> {
    try {
      if (!this.googleApiKey) {
        console.warn('GOOGLE_MAPS_API_KEY not configured, skipping image fetch');
        return [];
      }
  
      // First search for the place
      const searchUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=500&name=${encodeURIComponent(placeName)}&key=${this.googleApiKey}`;
      
      const searchResponse = await firstValueFrom(this.httpService.get(searchUrl));
      
      if (!searchResponse.data.results || searchResponse.data.results.length === 0) {
        // Try a text search instead
        const textSearchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(placeName)}&location=${latitude},${longitude}&radius=1000&key=${this.googleApiKey}`;
        
        const textSearchResponse = await firstValueFrom(this.httpService.get(textSearchUrl));
        
        if (!textSearchResponse.data.results || textSearchResponse.data.results.length === 0) {
          return [];
        }
        
        // Use the first result from text search
        const placeId = textSearchResponse.data.results[0].place_id;
        return this.getPhotoUrlsByPlaceId(placeId);
      }
      
      // Use the first result from nearby search
      const placeId = searchResponse.data.results[0].place_id;
      return this.getPhotoUrlsByPlaceId(placeId);
    } catch (error) {
      console.error('Error fetching place image URLs:', error);
      return [];
    }
  }
  private parseAiResponse(content: string): any {
    try {
      // If the content is already a JSON string
      const parsed = JSON.parse(content);
      
      // Ensure the response has the expected structure
      if (!parsed.places || !Array.isArray(parsed.places)) {
        console.warn('AI response missing places array, returning empty array');
        return { places: [] };
      }
      
      return parsed;
    } catch (error) {
      console.error('Error parsing AI response as direct JSON:', error);
      
      // If parsing fails, extract JSON from the text response
      const jsonMatch = content.match(/```json([\s\S]*?)```/) || 
                        content.match(/{[\s\S]*}/);
      
      if (jsonMatch) {
        try {
        //   console.log('Attempting to parse extracted JSON from response');
          const parsed = JSON.parse(jsonMatch[1] ? jsonMatch[1].trim() : jsonMatch[0]);
          
          // Ensure the response has the expected structure
          if (!parsed.places || !Array.isArray(parsed.places)) {
            console.warn('Extracted JSON missing places array, returning empty array');
            return { places: [] };
          }
          
          return parsed;
        } catch (e) {
          console.error('Failed to parse extracted JSON from AI response:', e);
          throw new Error('Invalid AI response format');
        }
      }
      
      console.error('Could not find JSON in AI response');
      throw new Error('Could not extract JSON from AI response');
    }
  }

  // Get static map image URL
  private getStaticMapUrl(latitude: number, longitude: number): string | null {
    if (!this.googleApiKey) {
      console.warn('GOOGLE_MAPS_API_KEY not configured, skipping map image');
      return null;
    }
    
    return `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=16&size=600x300&maptype=roadmap&markers=color:red%7C${latitude},${longitude}&key=${this.googleApiKey}`;
  }

  // Get place images from Google Places API as buffers
  private async getPlaceImages(placeName: string, latitude: number, longitude: number): Promise<Buffer[]> {
    try {
      if (!this.googleApiKey) {
        console.warn('GOOGLE_MAPS_API_KEY not configured, skipping image fetch');
        return [];
      }

    //   console.log(`Fetching images for place: ${placeName} at ${latitude}, ${longitude}`);

      // First search for the place
      const searchUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=500&name=${encodeURIComponent(placeName)}&key=${this.googleApiKey}`;
    //   console.log(`Making Places API nearby search request: ${searchUrl}`);
      
      const searchResponse = await firstValueFrom(this.httpService.get(searchUrl));
    //   console.log(`Places API nearby search response status: ${searchResponse.status}`);
      
      let placeId: string | null = null;
      
      if (!searchResponse.data.results || searchResponse.data.results.length === 0) {
        console.warn(`No places found for ${placeName} at ${latitude},${longitude}`);
        
        // Try a text search instead
        const textSearchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(placeName)}&location=${latitude},${longitude}&radius=1000&key=${this.googleApiKey}`;
        // console.log(`Making Places API text search request: ${textSearchUrl}`);
        
        const textSearchResponse = await firstValueFrom(this.httpService.get(textSearchUrl));
        // console.log(`Places API text search response status: ${textSearchResponse.status}`);
        
        if (!textSearchResponse.data.results || textSearchResponse.data.results.length === 0) {
          console.warn(`No places found in text search for ${placeName}`);
          return [];
        }
        
        // Use the first result from text search
        placeId = textSearchResponse.data.results[0].place_id;
        // console.log(`Found place ID from text search: ${placeId}`);
      } else {
        // Use the first result from nearby search
        placeId = searchResponse.data.results[0].place_id;
        // console.log(`Found place ID from nearby search: ${placeId}`);
      }
      
      if (!placeId) {
        return [];
      }
      
      // Get photo URLs
      const photoUrls = await this.getPhotoUrlsByPlaceId(placeId);
      
      // Download the images
      const imageBuffers: Buffer[] = [];
      for (const url of photoUrls) {
        try {
          const imageBuffer = await this.downloadImage(url);
          imageBuffers.push(imageBuffer);
        } catch (error) {
          console.error(`Error downloading image from ${url}:`, error);
          // Continue with other images if one fails
        }
      }
      
      return imageBuffers;
    } catch (error) {
      console.error('Error fetching place images:', error);
      return [];
    }
  }
  
  // Helper method to download an image and return it as a buffer
  private async downloadImage(url: string): Promise<Buffer> {
    try {
    //   console.log(`Downloading image from: ${url}`);
      
      // For Google Places Photo API
      if (url.includes('maps.googleapis.com/maps/api/place/photo')) {
        // First make a request to get the actual image URL (Google redirects)
        const headResponse = await firstValueFrom(
          this.httpService.get(url, { 
            maxRedirects: 0,
            validateStatus: status => status >= 200 && status < 400
          })
        );
        
        // If we got a redirect, use the redirect URL
        if (headResponse.headers.location) {
        //   console.log(`Following redirect to: ${headResponse.headers.location}`);
          url = headResponse.headers.location;
        }
      }
      
      // Now download the actual image
      const response = await firstValueFrom(
        this.httpService.get(url, { 
          responseType: 'arraybuffer',
          headers: {
            'Accept': 'image/jpeg,image/png,image/*'
          }
        })
      );
      
    //   console.log(`Downloaded image size: ${response.data.byteLength} bytes`);
      return Buffer.from(response.data);
    } catch (error) {
      console.error(`Error downloading image from ${url}:`, error);
      throw error;
    }
  }
  
  // Helper method to get photo URLs by place ID
  private async getPhotoUrlsByPlaceId(placeId: string): Promise<string[]> {
    try {
      // Get place details including photos
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=photos&key=${this.googleApiKey}`;
    //   console.log(`Making Places API details request: ${detailsUrl}`);
      
      const detailsResponse = await firstValueFrom(this.httpService.get(detailsUrl));
    //   console.log(`Places API details response status: ${detailsResponse.status}`);
      
      if (!detailsResponse.data.result || 
          !detailsResponse.data.result.photos || 
          detailsResponse.data.result.photos.length === 0) {
        console.warn(`No photos found for place ID ${placeId}`);
        return [];
      }
      
      // Get photo references and construct photo URLs
      const photoReferences = detailsResponse.data.result.photos.map(photo => photo.photo_reference);
    //   console.log(`Found ${photoReferences.length} photo references`);
      
      // Construct URLs for the photos (limit to 3 to avoid excessive API usage)
      const photoUrls = photoReferences.slice(0, 3).map(ref => 
        `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${ref}&key=${this.googleApiKey}`
      );
      
      return photoUrls;
    } catch (error) {
      console.error(`Error fetching photos for place ID ${placeId}:`, error);
      return [];
    }
  }

  async addAiSuggestedPlace(placeData: any, userId: string): Promise<any> {
    try {
      // Parse coordinates
      const latitude = parseFloat(placeData.latitude);
      const longitude = parseFloat(placeData.longitude);
      
      // Validate coordinates
      if (isNaN(latitude) || isNaN(longitude)) {
        throw new HttpException('Invalid coordinates in place data', 400);
      }
      
      // TEMPORARILY DISABLE THAILAND CHECK FOR DEBUGGING
      // Just log a warning instead of throwing an error
      if (!this.isInThailand(latitude, longitude)) {
        console.warn(`Warning: Place coordinates (${latitude}, ${longitude}) appear to be outside Thailand's boundaries, but proceeding anyway for testing.`);
        // Don't throw an exception for now
        // throw new HttpException('Location must be within Thailand', 400);
      }
      
      // Prepare place data
      const createPlaceDto: CreatePlaceDto = {
        name: placeData.name || placeData.thai_name || 'Unnamed Place',
        description: this.formatPlaceDescription(placeData),
        latitude: latitude,
        longitude: longitude,
        // Add any additional fields your CreatePlaceDto requires
      };
      
      // Use the photoBuffers if available, otherwise try to extract from photos
      let imageBuffers: Buffer[] = [];
      
      if (placeData.photoBuffers && Array.isArray(placeData.photoBuffers)) {
        imageBuffers = placeData.photoBuffers;
      } else if (placeData.photos && Array.isArray(placeData.photos)) {
        // Try to extract buffers from data URLs
        for (const photo of placeData.photos) {
          if (typeof photo === 'string' && photo.startsWith('data:image')) {
            try {
              // Extract base64 part from data URL
              const base64Data = photo.split(',')[1];
              const buffer = Buffer.from(base64Data, 'base64');
              imageBuffers.push(buffer);
            } catch (error) {
              console.error('Error converting data URL to buffer:', error);
            }
          } else if (typeof photo === 'string') {
            // If it's a URL, download the image
            try {
              const imageBuffer = await this.downloadImage(photo);
              imageBuffers.push(imageBuffer);
            } catch (error) {
              console.error(`Error downloading image from URL: ${error.message}`);
            }
          }
        }
      }
      
      // Use your existing place service to create the place with images
      return await this.placesService.create(createPlaceDto, imageBuffers, userId);
    } catch (error) {
      console.error('Error adding AI suggested place:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(`Failed to add AI suggested place: ${error.message}`, 500);
    }
  }
  
  // Format a comprehensive description from the AI data
  private formatPlaceDescription(placeData: any): string {
    let description = placeData.description || '';
    
    // Add type information if available
    if (placeData.type) {
      description += `\n\nType: ${placeData.type}`;
    }
    
    // Add amenities if available
    if (placeData.amenities) {
      description += `\n\nAmenities: ${placeData.amenities}`;
    }
    
    // Add Thai name if available and different from main name
    if (placeData.thai_name && placeData.name !== placeData.thai_name) {
      description += `\n\nThai name: ${placeData.thai_name}`;
    }
    
    return description;
  }
}