import { Module } from '@nestjs/common';
import {ConfigModule} from "@nestjs/config";
import { DatabaseModule } from './database/database.module';
import { PlacesModule } from './places/places.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
      ConfigModule.forRoot({isGlobal: true}),
      DatabaseModule,
      PlacesModule,
      UsersModule,
      AuthModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
