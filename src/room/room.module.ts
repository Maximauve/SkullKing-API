import { Module } from '@nestjs/common';
import { RoomController } from './controller/room.controller';
import { RoomService } from './service/room.service';
import {forwardRef} from "@nestjs/common/utils";
import {RedisModule} from "../redis/redis.module";
import {PirateGlossaryModule} from "../pirate-glossary/pirate-glossary.module";
import {RoomWebsocketGateway} from "./room.websocket.gateway";
import {GameModule} from "../game/game.module";

@Module({
  imports: [forwardRef(() => RedisModule), forwardRef(() => PirateGlossaryModule), forwardRef(() => GameModule)],
  controllers: [RoomController],
  providers: [RoomService],
  exports: [RoomService]
})
export class RoomModule {}
