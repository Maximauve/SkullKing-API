import { Module } from '@nestjs/common';
import {RedisService} from "./service/redis.service";
import {RedisController} from "./controller/redis.controller";

@Module({
  imports: [],
  controllers: [RedisController],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}