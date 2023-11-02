import { Injectable } from '@nestjs/common';
import {RedisService} from "../../redis/service/redis.service";
import {RoomModel} from "../room.model";
import {PirateGlossaryService} from "../../pirate-glossary/service/pirate-glossary.service";
import {HttpException} from "@nestjs/common/exceptions";

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

  async getRooms(): Promise<RoomModel[]> {
    const roomKeys = await this.redisService.keys('room:*');
    const rooms: RoomModel[] = [];
    for (const roomKey of roomKeys) {
      const roomData = await this.redisService.hgetall(roomKey);
      const room: RoomModel = {
        slug: roomData.slug,
        maxPlayers: parseInt(roomData.maxPlayers, 10),
        currentPlayers: parseInt(roomData.currentPlayers, 10),
        password: roomData.password || '',
        users: JSON.parse(roomData.users || '[]'),
      };
      rooms.push(room);
    }
    return rooms;
  }

  async getRoom(slug: string): Promise<RoomModel> {
    const roomKey = `room:${slug}`;
    if (await this.redisService.exists(roomKey) == 0) {
      throw new HttpException("Room not found",  404);
    }
    const roomData = await this.redisService.hgetall(roomKey);
    const room: RoomModel = {
      slug: roomData.slug,
      maxPlayers: parseInt(roomData.maxPlayers, 10),
      currentPlayers: parseInt(roomData.currentPlayers, 10),
      password: roomData.password || '',
      users: JSON.parse(roomData.users || '[]'),
    };
    return room;
  }

  async closeRoom(slug: string): Promise<{}> {
    const roomKey = `room:${slug}`;
    if (await this.redisService.exists(roomKey) == 0) {
      throw new HttpException("Room not found",  404);
    }
    await this.redisService.del(roomKey);
    return {
      message: `Room ${slug} deleted`
    }
  }
}
