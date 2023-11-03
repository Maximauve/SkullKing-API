import { Module } from '@nestjs/common';
import { RoomController } from './controller/room.controller';
import { RoomService } from './service/room.service';
import {forwardRef} from "@nestjs/common/utils";
import {RedisModule} from "../redis/redis.module";
import {PirateGlossaryModule} from "../pirate-glossary/pirate-glossary.module";
import {RoomWebsocketGateway} from "./room.websocket.gateway";

@Module({
  imports: [forwardRef(() => RedisModule), forwardRef(() => PirateGlossaryModule)],
  controllers: [RoomController],
  providers: [RoomService, RoomWebsocketGateway],
  exports: [RoomService]
})
export class RoomModule {}
