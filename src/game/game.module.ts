import { Module } from '@nestjs/common';
import { GameController } from './controller/game.controller';
import {forwardRef} from "@nestjs/common/utils";
import {RedisModule} from "../redis/redis.module";
import {GameService} from "./service/game.service";

@Module({
  imports: [forwardRef(() => RedisModule)],
  controllers: [GameController],
  providers: [GameService],
  exports: [GameService],
})
export class GameModule {}
