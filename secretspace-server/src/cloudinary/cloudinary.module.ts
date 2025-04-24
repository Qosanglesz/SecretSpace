import { Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';

@Module({
  controllers: [],
  providers: [CloudinaryService],
})
export class CloudinaryModule {}
