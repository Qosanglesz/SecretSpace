import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';

export const CloudinaryProvider = {
    provide: 'CLOUDINARY',
    useFactory: (configService: ConfigService) => {
        return cloudinary.config({
            cloud_name: configService.getOrThrow('CLOUDINARY_NAME'),
            api_key: configService.getOrThrow('CLOUDINARY_API_KEY'),
            api_secret: configService.getOrThrow('CLOUDINARY_API_SECRET'),
        });
    },
    inject: [ConfigService],
};
