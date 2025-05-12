import { Module } from '@nestjs/common';
import {ConfigModule} from "@nestjs/config";
import { DatabaseModule } from './database/database.module';
import { PlacesModule } from './places/places.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [
      ConfigModule.forRoot({isGlobal: true}),
      CloudinaryModule,
      DatabaseModule,
      PlacesModule,
      UsersModule,
      AuthModule,
      AiModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
