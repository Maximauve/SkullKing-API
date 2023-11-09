import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {TypeOrmModule, TypeOrmModuleAsyncOptions} from '@nestjs/typeorm';
import { User } from './users/users.entity';
import { UsersModule } from './users/users.module';
import {CardsModule} from "./cards/cards.module";
import {Card} from "./cards/cards.entity";
import {CardTypeModule} from "./cards-types/cards-types.module";
import {CardType} from "./cards-types/cards-types.entity";
import {RedisModule} from "./redis/redis.module";
import {PirateGlossaryModule} from "./pirate-glossary/pirate-glossary.module";
import {PirateGlossary} from "./pirate-glossary/pirate-glossary.entity";
import {RoomModule} from './room/room.module';
import {APP_GUARD, APP_FILTER} from '@nestjs/core';
import {RoomWebsocketGateway} from './room/room.websocket.gateway';
import {JwtAuthGuard} from "./auth/guards/jwt-auth.guard";
import {AuthExceptionFilter} from "./auth/exception-filter/exception-filter";
import { HomeControllerController } from './home-controller/home-controller.controller';

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true}),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('POSTGRES_HOST'),
        port: +configService.get<number>('POSTGRES_PORT'),
        username: configService.get('POSTGRES_USER'),
        password: configService.get('POSTGRES_PASSWORD'),
        database: configService.get('POSTGRES_DATABASE'),
        entities: [User, Card, CardType, PirateGlossary],
        synchronize: true,
        extra: {
          ssl: true,
        }
      }),
      inject: [ConfigService],
    } as TypeOrmModuleAsyncOptions),
    UsersModule,
    CardsModule,
    CardTypeModule,
    RedisModule,
    PirateGlossaryModule,
    RoomModule,
  ],
  controllers: [HomeControllerController],
  providers: [RoomWebsocketGateway,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: AuthExceptionFilter,
    }
  ],
})
export class AppModule {
}
