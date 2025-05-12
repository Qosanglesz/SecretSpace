// src/ai/ai.module.ts
import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { PlacesModule } from '../places/places.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    PlacesModule,
    HttpModule,
  ],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}