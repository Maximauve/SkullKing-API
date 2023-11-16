import {Injectable} from "@nestjs/common";
import FullCards from "../../script/cards";
import {Card} from "../../script/Card";
import {Bet, Play, PlayCard, Pli, RoomModel, RoundModel, User, UserInRoom} from "../../room/room.model";
import {RedisService} from "../../redis/service/redis.service";
import {RoomService} from "../../room/service/room.service";

@Injectable()
export class GameService {
  constructor(
    private redisService: RedisService,
    private roomService: RoomService,
  ) {}

  async getCards(): Promise<{}> {
    return FullCards;
  }

  async flushCards(): Promise<Card[]> {
    let fullCards: Card[] = FullCards;
    fullCards.sort(() => Math.random() - 0.5);
    return fullCards;
  }

  async startGame(slug: string, user: User): Promise<User[]> {
    const room = await this.roomService.getRoom(slug);
    if (room.host.userId != user.userId) throw new Error("Vous n'êtes pas le créateur de la room");
    if (room.currentPlayers < 2) throw new Error("Il n'y a pas assez de joueurs");
    if (room.started == true) throw new Error("La partie à déjà commencé");
    room.users = await this.newRound(slug);
    await this.redisService.hset(`room:${slug}`, ['started', 'true']);
    return room.users;
  }

  async newRound(slug: string): Promise<User[]> {
    const room = await this.roomService.getRoom(slug);
    const fullCards: Card[] = await this.flushCards();
    for (const [index, user] of room.users.entries()) {
      user.cards = fullCards.slice((room.currentRound + 1) * index, (room.currentRound + 1) * (index+1));
    }
    await this.redisService.hset(`room:${slug}`, ['users', JSON.stringify(room.users), 'currentRound', (room.currentRound + 1).toString()]);
    return room.users;
  }

  async bet(bet: Bet, user: User): Promise<[Bet, User, boolean]> {
    let room: RoomModel = await this.roomService.getRoom(bet.slug);
    let round = await this.roomService.getRound(bet.slug, room.currentRound);
    if (round.users.find((elem: RoundModel) => elem.userId == user.userId)) throw new Error("Vous avez déjà parié");
    if (bet.wins > room.currentRound || bet.wins < 0) throw new Error("Vous ne pouvez pas parier plus que le nombre de manche");
    let total: number = room.users.find((elem: User) => elem.userId == user.userId)?.points;
    round.users.push({userId: user.userId, wins: bet.wins, nbWins: null, points: null, bonus: null, total: total});
    await this.redisService.hset(`room:${bet.slug}:${room.currentRound}`, ['users', JSON.stringify(round.users)]);
    if (round.users.length == room.users.length) {
      return [bet, user, true]
    }
    return [bet, user, false]
  }

  async endRound(slug: string): Promise<void> {
    const room = await this.roomService.getRoom(slug);
    const round = await this.roomService.getRound(slug, room.currentRound);
    room.users = room.users.map((user: User) => {
      user.cards = [];
      return user;
    });
    const roomKeys = await this.redisService.keys(`room:${slug}:${room.currentRound}:*`)
    let winnersCount: {} = {};
    for (let room of roomKeys) {
      let pliData = await this.redisService.hgetall(room);
      let winnerId: string = JSON.parse(pliData.winner)?.userId
      let bonus: number = parseInt(pliData.bonus, 10)
      if (!winnersCount[winnerId]) {
        winnersCount[winnerId] = {
          nbWins: 0,
          bonus: 0,
        };
      }
      winnersCount[winnerId].nbWins++;
      winnersCount[winnerId].bonus += bonus;
    }
    for (const [index, user] of round.users.entries()) {
      user.nbWins = winnersCount[user.userId] ? winnersCount[user.userId].nbWins : 0;
      user.bonus = winnersCount[user.userId] ? winnersCount[user.userId].bonus : 0;
      user.points = user.nbWins == user.wins ? user.nbWins * 20 + user.bonus : (user.wins - user.nbWins > 0 ? user.wins - user.nbWins : user.nbWins - user.wins) * -10 + user.bonus;
      room.users.find((elem: User) => elem.userId == user.userId).points += user.points;
      user.total = room.users.find((elem: User) => elem.userId == user.userId).points;
      round.users[index] = user;
    }
    await this.redisService.hset(`room:${slug}:${room.currentRound}`, ['users', JSON.stringify(round.users)]);
    await this.redisService.hset(`room:${slug}`, ['users', JSON.stringify(room.users)]);
  }

  async newPli(pli: Pli): Promise<[Play, number]> {
    const room: RoomModel = await this.roomService.getRoom(pli.slug);
    const pliData = await this.roomService.getPli(pli);
    if (room.users.length !== pliData.plays.length) throw new Error("Tous les joueurs n'ont pas joué");
    const [winner, bonus] = await this.whoWinTheTrick(pliData.plays);
    await this.redisService.hset(`room:${pli.slug}:${pli.nbRound}:${pli.nbPli}`, ['winner', JSON.stringify(winner.user), 'bonus', bonus.toString()]);
    return [winner, bonus];
  }

  async whoWinTheTrick(plays: Play[]): Promise<[Play, number]> {
    let bonus: number = 0;
    let winner: Play = plays[0];
    let color: string = "";
    if (['mermaid', 'pirate', 'skull-king'].every(item => plays.map(play => play.card.type.slug).includes(item))) {
      // si il y a une sirène, un pirate et le skull king, la sirene l'emporte
      winner = plays.find(play => play.card.type.slug == 'mermaid');
      bonus += plays.map(item => checkBonus(item)).reduce((a, b) => a + b, 0);
      return [winner, bonus + 40];
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

  async playCard(playcard: PlayCard, user: User): Promise<[PlayCard, UserInRoom]> {
    let room: RoomModel = await this.roomService.getRoom(playcard.slug);
    let users: User[] = room.users;
    let userIndex: number = users.findIndex((elem: User) => elem.userId == user.userId);
    if (!userIndex) throw new Error("Vous n'êtes pas dans la room");
    if (!users[userIndex].hasToPlay) throw new Error("Ce n'est pas à vous de jouer");
    let pli = await this.redisService.hgetall(`room:${playcard.slug}:${playcard.nbRound}:${playcard.nbPli}`)
    let plays = JSON.parse(pli.plays);
    if (playcard.card.id != room.users.find((user: User) => user.userId == playcard.user.userId)?.cards.find((card: Card) => card.id == playcard.card.id).id) {
      throw new Error("Vous n'avez pas cette carte");
    }
    await this.redisService.hset(`room:${playcard.slug}:${playcard.nbRound}:${playcard.nbPli}`, ['plays', JSON.stringify([...plays, playcard])]);
    if (userIndex == users.length - 1) {
      users[0].hasToPlay = true;
      users[userIndex].hasToPlay = false;
    } else {
      users[userIndex + 1].hasToPlay = true;
      users[userIndex].hasToPlay = false;
    }
    await this.redisService.hset(`room:${playcard.slug}`, ['users', JSON.stringify(users)]);
    let newUser: UserInRoom = await this.userWithoutCards(user);
    return [playcard, newUser];
  }

  async userWithoutCards(user: User): Promise<UserInRoom> {
    return {
      userId: user.userId,
      username: user.username,
      socketId: user.socketId,
      points: user.points,
      hasToPlay: user.hasToPlay,
    }
  }

  async checkEndPli(pliData: Pli): Promise<boolean> {
    const room = await this.roomService.getRoom(pliData.slug);
    const pli = await this.roomService.getPli(pliData);
    return pli.plays.length == room.users.length;
  }

  async checkEndRound(slug: string, nbRound: number): Promise<boolean> {
    return await this.redisService.exists(`room:${slug}:${nbRound}:${nbRound}`) != 0;
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

