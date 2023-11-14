import {Injectable} from '@nestjs/common';
import {RedisService} from "../../redis/service/redis.service";
import {RoomModel, Round, RoundModel, User, UserInRoom, UserWithHost} from "../room.model";
import {PirateGlossaryService} from "../../pirate-glossary/service/pirate-glossary.service";
import {HttpException} from "@nestjs/common/exceptions";

@Injectable()
export class RoomService {
  private rooms : RoomModel[] = [];

  constructor (
    private redisService: RedisService,
    private pirateGlossaryService: PirateGlossaryService
  ) {}

  async createRoom(maxPlayers: number, host: User, password?: string): Promise<RoomModel> {
    const room: RoomModel = {
      slug: await this.pirateGlossaryService.GetThreeWord(),
      maxPlayers: maxPlayers,
      currentPlayers: 1,
      password: password,
      users: [host],
      host: host,
      started: false,
      currentRound: 0,
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
      'slug', room.slug,
      'started', room.started.toString(),
      'currentRound', '0',
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
          started: roomData.started == 'true',
          currentRound: parseInt(roomData.currentRound, 10),
        };
      }
    }
    return null;
  }

  async addUserToRoom(slug: string, user: User) : Promise<void> {
    try {
      const room = await this.getRoom(slug);
      if (room) {
        if (room.started == true && !room.users.find((element: User) => user.userId == element.userId)) throw new HttpException("La partie à déjà commencé",  409);
        if (room.currentPlayers >= room.maxPlayers && !room.users.find((element: User) => user.userId === element.userId)) throw new HttpException("La room est pleine",  409);
        if (room.host.userId == user.userId) {
          let host = room.users.find((element: User) => element.userId == user.userId)
          if (!host) room.users.push(user)
          else host.socketId = user.socketId
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
    } catch (e) {
      return Promise.reject(e)
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
    await this.redisService.hset(`room:${slug}`, ['users', JSON.stringify(room.users), 'currentPlayers', (room.currentPlayers - 1).toString()]);
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
        started: roomData.started == 'true',
        currentRound: parseInt(roomData.currentRound, 10),
      };
      rooms.push(room);
    }
    return rooms;
  }

  async getRoom(slug: string): Promise<RoomModel> {
    const roomKey = `room:${slug}`;
    if (await this.redisService.exists(roomKey) == 0) {
      throw new HttpException(`La room ${slug} n'existe pas`,  404);
    }
    const roomData = await this.redisService.hgetall(roomKey);
    return {
      slug: roomData.slug,
      maxPlayers: parseInt(roomData.maxPlayers, 10),
      currentPlayers: parseInt(roomData.currentPlayers, 10),
      password: roomData.password || '',
      users: JSON.parse(roomData.users || '[]'),
      host: JSON.parse(roomData.host),
      started: roomData.started == 'true',
      currentRound: parseInt(roomData.currentRound, 10),
    } as RoomModel;
  }

  async getRound(slug: string, nbRound: number): Promise<{ users: RoundModel[] }> {
    const roomKey = `room:${slug}:${nbRound}`;
    if (await this.redisService.exists(roomKey) == 0) {
      throw new HttpException(`Le round ${roomKey} n'existe pas`,  404);
    }
    const roundData = await this.redisService.hgetall(roomKey);
    return {
      users: JSON.parse(roundData.users || '[]'),
    } as { users: RoundModel[] };
  }

  async getRoomUsersInRoom(slug: string): Promise<UserWithHost[]> {
    const room = await this.getRoom(slug);
    return room.users.map((user: User) => {
      return {
        userId: user.userId,
        username: user.username,
        socketId: user.socketId,
        points: user.points,
        isHost: user.userId === room.host.userId,
      }
    }) as UserWithHost[];
  }

  async usersInRoom(slug: string): Promise<User[]> {
    const room = await this.getRoom(slug);
    return room.users;
  }

  async gameIsStarted(slug: string): Promise<boolean> {
    const room = await this.getRoom(slug);
    return room.started;
  }

  async usersWithoutCardsInRoom(slug: string): Promise<UserInRoom[]> {
    return await this.getRoomUsersInRoom(slug);
  }

  async kickUser(slug: string, username: string): Promise<void> {
    const room = await this.getRoom(slug);
    const user = room.users.find((user: User) => user.username === username);
    if (!user) throw new HttpException("L'utilisateur n'existe pas", 404);
    await this.removeUserFromRoom(user.socketId, slug);
  }
}

















// ===> ROOM

// "currentPlayers"
// "host"
// "password"
// "started"
// "maxPlayers"
// "users" => [{"userId":"id", "username":"string", "socketId":"string", "cards":"Card[]", "points":"number"}, user, user]
// "slug"


// ===> MANCHES
// room:slug:3
//
// users -> [{"userId":"id", "parier": 2, "nbGagné": null, "nbPointGagnés": "number", "bonus":"number","total":"number"}, user, user]
//
// ====> PLI
// room:slug:1:1
//
// winner -> user
// bonus -> points
// plays -> [{"card": card, "user": user}, play, play]

// keys('room:slug:nbManche:*')




