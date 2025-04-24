import { Module } from '@nestjs/common';
import {ConfigModule} from "@nestjs/config";
import { DatabaseModule } from './database/database.module';
import { PlacesModule } from './places/places.module';

@Module({
  imports: [
      ConfigModule.forRoot({isGlobal: true}),
      DatabaseModule,
      PlacesModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
