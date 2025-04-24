import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.getOrThrow('POSTGRES_HOST'),
                port: configService.getOrThrow('POSTGRES_PORT'),
                database: configService.getOrThrow('POSTGRES_DB'),
                username: configService.getOrThrow('POSTGRES_USER'),
                password: configService.getOrThrow('POSTGRES_PASSWORD'),
                autoLoadEntities: true,
                synchronize: configService.getOrThrow('POSTGRES_SYNCHRONIZE'),
            }),
            inject: [ConfigService],
        }),
    ],
})
export class DatabaseModule {}