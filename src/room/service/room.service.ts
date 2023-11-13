import { Injectable } from '@nestjs/common';
import {RedisService} from "../../redis/service/redis.service";
import {Play, RoomModel, User} from "../room.model";
import {PirateGlossaryService} from "../../pirate-glossary/service/pirate-glossary.service";
import {HttpException} from "@nestjs/common/exceptions";
import {GameService} from "../../game/service/game.service";
import {Card} from "../../script/Card";

@Injectable()
export class RoomService {
  private rooms : RoomModel[] = [];

  constructor (
    private redisService: RedisService,
    private pirateGlossaryService: PirateGlossaryService,
    private gameService: GameService,
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
        };
      }
    }
    return null;
  }

  async addUserToRoom(slug: string, user: User) : Promise<void> {
    const room = await this.getRoom(slug);
    if (room) {
      if (room.started == true) throw new HttpException("La partie à déjà commencé",  409);
      if (room.currentPlayers >= room.maxPlayers && !room.users.find(element => user.userId === element.userId)) throw new HttpException("La room est pleine",  409);
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
    const room: RoomModel = {
      slug: roomData.slug,
      maxPlayers: parseInt(roomData.maxPlayers, 10),
      currentPlayers: parseInt(roomData.currentPlayers, 10),
      password: roomData.password || '',
      users: JSON.parse(roomData.users || '[]'),
      host: JSON.parse(roomData.host),
      started: roomData.started == 'true',
    };
    return room;
  }

  async usersInRoom(slug: string): Promise<User[]> {
    const room = await this.getRoom(slug);
    return room.users;
  }

  async kickUser(slug: string, username: string): Promise<void> {
    const room = await this.getRoom(slug);
    const user = room.users.find((user: User) => user.username === username);
    if (!user) throw new HttpException("L'utilisateur n'existe pas", 404);
    await this.removeUserFromRoom(user.socketId, slug);
  }

  async startGame(slug: string, user: User): Promise<User[]> {
    const room = await this.getRoom(slug);
    if (room.host.userId != user.userId) throw new HttpException("Vous n'êtes pas le créateur de la room", 403);
    if (room.currentPlayers < 2) throw new HttpException("Il n'y a pas assez de joueurs", 409);
    if (room.started == true) throw new HttpException("La partie à déjà commencé", 409);
    room.users = await this.newRound({ slug: slug, nbCards: 1 });
    await this.redisService.hset(`room:${slug}`, ['started', 'true']);
    return room.users;
  }

  async newRound(body: { slug: string, nbCards: number }): Promise<User[]> {
    const room = await this.getRoom(body.slug);
    const fullCards: Card[] = await this.gameService.flushCards();
    for (const [index, user] of room.users.entries()) {
      user.cards = fullCards.slice(body.nbCards * index, body.nbCards * (index+1));
    }
    await this.redisService.hset(`room:${body.slug}`, ['users', JSON.stringify(room.users)]);
    return room.users;
  }

  async whoWinTheTrick(plays: Play[]): Promise<[Play, number]> {
    let bonus = 0;
    let winner: Play = plays[0];
    let color = "";
    if (['mermaid', 'pirate', 'skull-king'].every(item => plays.map(play => play.card.type.slug).includes(item))) {
      // si il y a une sirène, un pirate et le skull king, la sirene l'emporte
      winner = plays.find(play => play.card.type.slug == 'mermaid');
      return [winner, 40];
    }
    if (winner.card.value && winner.card.value == 14) {
      if (winner.card.type.slug == 'black') {
        bonus += 20;
      } else {
        bonus += 10;
      }
    }
    for (const play of plays.slice(1)) {
      [color, winner, bonus] = WinPlay(winner, play, color, bonus);
    }
    return [winner, bonus];
  }
}

const WinPlay = (play1: Play, play2: Play, color: string, bonus: number): [string, Play, number] => {
  let winner = play1;
  if (color === "" && ['yellow','green','purple'].includes(play1.card.type.slug)) {
    color = play1.card.type.slug;
  }
  bonus += checkBonus(play2);
  if (play1.card.type.slug == play2.card.type.slug) {
    if (play1.card.value) {
      if (play1.card.value < play2.card.value) {
        winner = play2;
      }
    } else { // si il y a deux têtes, la premiere l'emporte
      winner = play1;
    }
  } else {
    if (play2.card.type.superior_to.includes(play1.card.type.slug)) {
      bonus += checkBonus(play2, play1)
      winner = play2;
    } else if (play1.card.type.superior_to.includes(play2.card.type.slug)) {
      bonus += checkBonus(play1, play2)
      winner = play1;
    } else {
      if (play2.card.type.slug == color && play2.card.value > play1.card.value) {
        winner = play2;
      }
    }
  }
  return [color, winner, bonus];
}

const checkBonus = (play1: Play, play2: Play = null): number => {
  if (play2) {
    if (play1.card.type.slug == 'pirate' && play2.card.type.slug == 'mermaid') {
      return 20;
    } else if (play1.card.type.slug == 'skull-king' && play2.card.type.slug == 'pirate') {
      return 30;
    } else if (play1.card.type.slug == 'mermaid' && play2.card.type.slug == 'skull-king') {
      return 40;
    }
  } else {
    if (play1.card.value && play1.card.value == 14) {
      if (play1.card.type.slug == 'black') {
        return 20;
      } else {
        return 10;
      }
    }
  }
  return 0;
}




















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
// keys('room:slug:nbManche:*')

// ===> CHAQUE CARTE JOUER
// Subcriber play
// Get card + user
// Check if user has the card
// append card + user dans room:slug:nbManche:pli
// emit carte joué

// si room:slug:nbManche:pli.length == room.users.length
//   whoWinTheTrick(room:slug:nbManche:pli)
// <====




