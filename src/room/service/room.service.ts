import { Injectable } from '@nestjs/common';
import {RedisService} from "../../redis/service/redis.service";
import {RoomModel} from "../room.model";
import {PirateGlossaryService} from "../../pirate-glossary/service/pirate-glossary.service";

@Injectable()
export class RoomService {
  private rooms : RoomModel[] = [];
  constructor(
    private redisService: RedisService,
    private pirateGlossaryService: PirateGlossaryService,
  ) {}

  async createRoom(maxPlayers: number, password?: string): Promise<RoomModel> {
    const room: RoomModel = {
      slug: await this.pirateGlossaryService.GetThreeWord(),
      maxPlayers: maxPlayers,
      currentPlayers: 0,
      password: password,
      users: [],
    }
    let roomKey = `room:${room.slug}`;
    // check if key exists in redis to not overwrite
    while (await this.redisService.exists(roomKey) == 1) {
      room.slug = await this.pirateGlossaryService.GetThreeWord();
      roomKey = `room:${room.slug}`;
    }
    await this.redisService.hset(roomKey, [
      'maxPlayers', room.maxPlayers.toString(),
      'currentPlayers', room.currentPlayers.toString(),
      'password', room.password ?? '',
      'users', JSON.stringify(room.users)
    ]);
    this.rooms = [...this.rooms, room];
    return room;
  }
}
