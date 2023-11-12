import { Module } from '@nestjs/common';
import { GameController } from './controller/game.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {User} from "../users/users.entity";
import {forwardRef} from "@nestjs/common/utils";
import {AuthModule} from "../auth/auth.module";
import {RedisModule} from "../redis/redis.module";
import {UsersController} from "../users/controllers/users.controller";
import {UsersService} from "../users/services/users.service";
import {GameService} from "./service/game.service";

@Module({
  imports: [],
  controllers: [GameController],
  providers: [GameService],
  exports: [GameService],
})
export class GameModule {}
