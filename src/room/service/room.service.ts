import { Injectable } from '@nestjs/common';
import {RedisService} from "../../redis/service/redis.service";
import {RoomModel, User} from "../room.model";
import {PirateGlossaryService} from "../../pirate-glossary/service/pirate-glossary.service";
import {HttpException} from "@nestjs/common/exceptions";

@Injectable()
export class RoomService {
  private rooms : RoomModel[] = [];

  constructor (
    private redisService: RedisService,
    private pirateGlossaryService: PirateGlossaryService,
  ) {}

  async createRoom(maxPlayers: number, host: User, password?: string): Promise<RoomModel> {
    const room: RoomModel = {
      slug: await this.pirateGlossaryService.GetThreeWord(),
      maxPlayers: maxPlayers,
      currentPlayers: 1,
      password: password,
      users: [host],
      host: host,
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
      'users', JSON.stringify(room.users),
      'host', JSON.stringify(room.host),
    ]);
    this.rooms = [...this.rooms, room];
    return room;
  }

  async closeRoom(slug: string): Promise<{}> {
    const roomKey = `room:${slug}`;
    if (await this.redisService.exists(roomKey) == 0) {
      throw new HttpException("La room n'existe pas",  404);
    }
    await this.redisService.del(roomKey);
    return {
      message: `La room ${slug} à été supprimé`
    }
  }

  async getRoomHost(hostname: string): Promise<RoomModel | null> {
    const roomKeys = await this.redisService.keys('room:*');
    for (const roomKey of roomKeys) {
      const roomData = await this.redisService.hgetall(roomKey);
      if (JSON.parse(roomData.host).username == hostname) {
        return {
          slug: roomData.slug,
          maxPlayers: parseInt(roomData.maxPlayers, 10),
          currentPlayers: parseInt(roomData.currentPlayers, 10),
          password: roomData.password || '',
          users: JSON.parse(roomData.users || '[]'),
          host: JSON.parse(roomData.host),
        };
      }
    }
    return null;
  }

  async addUserToRoom(slug: string, user: User) : Promise<void> {
    const room = await this.getRoom(slug);
    if (room) {
      if (room.host.userId == user.userId) {
        room.users.find((element: User) => element.userId == user.userId).socketId = user.socketId;
        await this.redisService.hset(`room:${slug}`, ['host', JSON.stringify(user), 'users', JSON.stringify(room.users)]);
      } else if (room.users.find((element: User) => element.userId == user.userId)) {
        room.users.find((element: User) => element.userId == user.userId).socketId = user.socketId;
        await this.redisService.hset(`room:${slug}`, ['users', JSON.stringify(room.users)]);
      } else {
        await this.redisService.hset(`room:${slug}`, ['users', JSON.stringify([...room.users, user]), 'currentPlayers', (room.currentPlayers + 1).toString()]);
      }
    } else {
      throw new HttpException("La room n'existe pas",  404);
    }
  }

  async findRoomsByUserSocketId(socketId: string): Promise<RoomModel[]> {
    const roomKeys = await this.redisService.keys('room:*');
    const filteredRooms = [];
    for (const roomKey of roomKeys) {
      const room = await this.redisService.hgetall(roomKey);
      const user = await JSON.parse(room.users).find((user: User) => user.socketId === socketId);
      if (user) {
        filteredRooms.push(room);
      }
    }
    return filteredRooms;
  }

  async removeUserFromAllRooms(socketId: string): Promise<void> {
    const rooms = await this.findRoomsByUserSocketId(socketId)
    for (const room of rooms) {
      await this.removeUserFromRoom(socketId, room.slug)
    }
  }

  async removeUserFromRoom(socketId: string, slug: string): Promise<void> {
    const room = await this.getRoom(slug)
    room.users = room.users.filter((user: User) => user.socketId !== socketId)
    if (room.users.length === 0) {
      await this.closeRoom(slug)
    }
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
        host: JSON.parse(roomData.host),
      };
      rooms.push(room);
    }
    return rooms;
  }

  async getRoom(slug: string): Promise<RoomModel> {
    const roomKey = `room:${slug}`;
    if (await this.redisService.exists(roomKey) == 0) {
      throw new HttpException("La room n'existe pas",  404);
    }
    const roomData = await this.redisService.hgetall(roomKey);
    const room: RoomModel = {
      slug: roomData.slug,
      maxPlayers: parseInt(roomData.maxPlayers, 10),
      currentPlayers: parseInt(roomData.currentPlayers, 10),
      password: roomData.password || '',
      users: JSON.parse(roomData.users || '[]'),
      host: JSON.parse(roomData.host)
    };
    return room;
  }
}
