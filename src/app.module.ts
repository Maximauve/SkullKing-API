import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/users.entity';
import { UsersModule } from './users/users.module';
import {CardsModule} from "./cards/cards.module";
import {Card} from "./cards/cards.entity";
import {CardTypeModule} from "./cards-types/cards-types.module";
import {CardType} from "./cards-types/cards-types.entity";

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true}),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mariadb',
        host: configService.get('DB_HOST'),
        port: +configService.get<number>('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [User, Card, CardType],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    CardsModule,
    CardTypeModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
