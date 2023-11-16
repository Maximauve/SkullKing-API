import {
  ConnectedSocket, MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';
import {Socket} from 'socket.io';
import {RedisService} from "../redis/service/redis.service";
import {HttpException} from "@nestjs/common/exceptions";
import {RoomService} from "./service/room.service";
import {Message} from "./dto/room.dto";
import { jwtDecode } from "jwt-decode";
import {Bet, Play, PlayCard, Pli, Round} from "./room.model";
import {GameService} from "../game/service/game.service";

@WebSocketGateway({ cors : '*', namespace: 'room'})
export class RoomWebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {

  constructor(private readonly redisService: RedisService,
              private readonly roomService: RoomService,
              private readonly gameService: GameService) {}

  @WebSocketServer() server;

  handleConnection(socket: Socket): void {
    const socketId = socket.id;
    const tokenData: {username: string, id: string} = jwtDecode(socket.handshake.query.token as string); // todo: jwt decode
    socket.data.user = {
      socketId: socketId,
      username: tokenData.username,
      userId: tokenData.id,
      point: 0,
      hasToPlay: false,
      cards: []
    };
    console.log(`New connecting... socket id:`, socketId);
  }

  handleDisconnect(socket: Socket): void {
    // gerer le cas si disconnect pendant une partie
    console.log(`Disconnecting... socket id:`, socket.id);
  }

  @SubscribeMessage('leaveRoom')
  async leaveRoom(@ConnectedSocket() client: Socket, @MessageBody() slug: string) {
    this.server.to(slug).emit('members', await this.roomService.usersWithoutCardsInRoom(slug));
  }

  @SubscribeMessage('joinRoom')
  async joinRoom(@ConnectedSocket() client: Socket, @MessageBody() slug: string): Promise<{}> {
    return this.handleAction(slug, async () => {
      await this.roomService.addUserToRoom(slug, client.data.user)
      client.join(slug);
      this.server.to(slug).emit('members', await this.roomService.usersWithoutCardsInRoom(slug));
      return {gameIsStarted: await this.roomService.gameIsStarted(slug)};
    });
  }

  @SubscribeMessage('chat')
  chat(@ConnectedSocket() client: Socket, @MessageBody() message: Message): { message : string } {
    // console.log("API chat message -> ", message);
    this.server.to(message.slug).emit('chat', message, client.data.user); // broadcast messages
    return {message: "Message bien envoyé"};
  }

  @SubscribeMessage('startGame')
  async startGame(@ConnectedSocket() client: Socket, @MessageBody() slug: string): Promise<{}> {
    return this.handleAction(slug, async () => {
      let users = await this.gameService.startGame(slug, client.data.user)
      for (const user of users) {
        this.server.to(user.socketId).emit('cards', user.cards);
      }
      this.server.to(slug).emit('gameStarted', true); // broadcast messages gameStarted
      return {gameIsStarted: await this.roomService.gameIsStarted(slug)};
    });
  }

  @SubscribeMessage('newRound')
  async newRound(@ConnectedSocket() client: Socket, @MessageBody() slug: string): Promise<{}> {
    return this.handleAction(slug, async () => {
      let users = await this.gameService.newRound(slug)
      for (const user of users) {
        this.server.to(user.socketId).emit('cards', user.cards);
      }
      this.server.to(slug).emit('newRound', true); // broadcast messages newRound
      return {message: "Nouvelle manche bien lancée"};
    });
  }

  @SubscribeMessage('bet')
  async bet(@ConnectedSocket() client: Socket, @MessageBody() bet: Bet): Promise<{}> {
    return this.handleAction(bet.slug, async () => {
      let [oldBet , user, endRound] = await this.gameService.bet(bet, client.data.user)
      this.server.to(bet.slug).emit('bet', [user, oldBet]); // broadcast messages bet
      if (endRound) {
        await this.gameService.endRound(bet.slug);
        this.server.to(bet.slug).emit('endRound', bet.slug); // broadcast messages endRound
        this.server.to(bet.slug).emit('member', await this.roomService.usersWithoutCardsInRoom(bet.slug)); // broadcast messages endRound
      }
    });
  }

  @SubscribeMessage('endRound')
  async endRound(@ConnectedSocket() client: Socket, @MessageBody() slug : string): Promise<{}> {
    return this.handleAction(slug, async () => {
      await this.gameService.endRound(slug);
      this.server.to(slug).emit('endRound', slug); // broadcast messages endRound
      this.server.to(slug).emit('member', await this.roomService.usersWithoutCardsInRoom(slug)); // broadcast messages endRound
      return {message: "Fin de manche bien lancée"};
    });
  }

  @SubscribeMessage('newPli')
  async newPli(@ConnectedSocket() client: Socket, @MessageBody() pli : Pli): Promise<{}> {
    return this.handleAction(pli.slug, async () => {
        let [winner, bonus] = await this.gameService.newPli(pli)
        this.server.to(pli.slug).emit('newPli', [winner, bonus]); // broadcast messages newPli
        return {message: "Nouveau pli bien terminé"};
    });
  }

  @SubscribeMessage('play')
  async play(@ConnectedSocket() client: Socket, @MessageBody() playcard : PlayCard): Promise<{}> {
    return this.handleAction(playcard.slug, async (card: PlayCard) => {
      let [play, user] = await this.gameService.playCard(card, client.data.user)
      let newPlayCard: Play = {
        card: play.card,
        user: play.user
      }
      this.server.to(card.slug).emit('cardplay', [newPlayCard, user]); // broadcast messages playcard
      let newPli: Pli = {
        slug: card.slug,
        nbRound: card.nbRound,
        nbPli: card.nbPli
      }
      if (await this.gameService.checkEndPli(newPli)) {
        let [winner, bonus] = await this.gameService.newPli(newPli)
        this.server.to(card.slug).emit('newPli', [winner, bonus]); // broadcast messages newPli
      }
    });
  }

  async handleAction(slug: string, callback: Function): Promise<{}> {
    try {
      if (await this.redisService.exists(`room:${slug}`)) {
        return await callback();
      } else {
        throw new Error("La room n'existe pas");
      }
    } catch (e) {
      return {
        error: e.message,
      }
    }
  }
}
