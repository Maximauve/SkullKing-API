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
import {Bet, CardPlayed} from "./room.model";
import {GameService} from "../game/service/game.service";
import {Card} from "../script/Card";

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
      cards: [],
    };
    socket.data.slug = socket.handshake.query.slug as string
    console.log(`New connecting... socket id:`, socketId);
  }

  handleDisconnect(socket: Socket): void {
    // gerer le cas si disconnect pendant une partie
    console.log(`Disconnecting... socket id:`, socket.id);
  }

  @SubscribeMessage('leaveRoom')
  async leaveRoom(@ConnectedSocket() client: Socket) {
    this.server.to(client.data.slug).emit('members', await this.roomService.usersWithoutCardsInRoom(client.data.slug));
  }

  @SubscribeMessage('joinRoom')
  async joinRoom(@ConnectedSocket() client: Socket): Promise<{}> {
    return this.handleAction(client.data.slug, async () => {
      await this.roomService.addUserToRoom(client.data.slug, client.data.user)
      client.join(client.data.slug);
      this.server.to(client.data.slug).emit('members', await this.roomService.usersWithoutCardsInRoom(client.data.slug));
      return {gameIsStarted: await this.roomService.gameIsStarted(client.data.slug)};
    });
  }

  @SubscribeMessage('chat')
  chat(@ConnectedSocket() client: Socket, @MessageBody() message: Message): { message : string } {
    // console.log("API chat message -> ", message);
    this.server.to(client.data.slug).emit('chat', message, client.data.user); // broadcast messages
    return {message: "Message bien envoyé"};
  }

  @SubscribeMessage('startGame')
  async startGame(@ConnectedSocket() client: Socket): Promise<{}> {
    return this.handleAction(client.data.slug, async () => {
      let users = await this.gameService.startGame(client.data.slug, client.data.user)
      for (const user of users) {
        this.server.to(user.socketId).emit('cards', user.cards);
      }
      this.server.to(client.data.slug).emit('gameStarted', true); // broadcast messages gameStarted
      return {gameIsStarted: await this.roomService.gameIsStarted(client.data.slug)};
    });
  }

  @SubscribeMessage('newRound')
  async newRound(@ConnectedSocket() client: Socket): Promise<{}> {
    return this.handleAction(client.data.slug, async () => {
      let users = await this.gameService.newRound(client.data.slug)
      for (const user of users) {
        this.server.to(user.socketId).emit('cards', user.cards);
      }
      this.server.to(client.data.slug).emit('newRound', true); // broadcast messages newRound
      return {message: "Nouvelle manche bien lancée"};
    });
  }

  @SubscribeMessage('bet')
  async bet(@ConnectedSocket() client: Socket, @MessageBody() bet: Bet): Promise<{}> {
    return this.handleAction(client.data.slug, async () => {
      let [oldBet , user, endRound] = await this.gameService.bet(bet, client.data.user, client.data.slug)
      this.server.to(client.data.slug).emit('bet', [user, oldBet]); // broadcast messages bet
      if (endRound) {
        await this.gameService.endRound(client.data.slug);
        this.server.to(client.data.slug).emit('endRound', client.data.slug); // broadcast messages endRound
        this.server.to(client.data.slug).emit('member', await this.roomService.usersWithoutCardsInRoom(client.data.slug)); // broadcast messages endRound
      }
    });
  }

  @SubscribeMessage('endRound')
  async endRound(@ConnectedSocket() client: Socket): Promise<{}> {
    return this.handleAction(client.data.slug, async () => {
      await this.gameService.endRound(client.data.slug);
      this.server.to(client.data.slug).emit('endRound', client.data.slug); // broadcast messages endRound
      this.server.to(client.data.slug).emit('member', await this.roomService.usersWithoutCardsInRoom(client.data.slug)); // broadcast messages endRound
      return {message: "Fin de manche bien lancée"};
    });
  }

  @SubscribeMessage('newPli')
  async newPli(@ConnectedSocket() client: Socket): Promise<{}> {
    return this.handleAction(client.data.slug, async () => {
        let [winner, bonus] = await this.gameService.newPli(client.data.slug)
        this.server.to(client.data.slug).emit('newPli', [winner, bonus]); // broadcast messages newPli
        return {message: "Nouveau pli bien terminé"};
    });
  }

  @SubscribeMessage('play')
  async play(@ConnectedSocket() client: Socket, @MessageBody() card: Card): Promise<{}> {
    return this.handleAction(client.data.slug, async () => {
      let [play, user, round] = await this.gameService.playCard(card, client.data.user, client.data.slug)
      let newPlayCard: CardPlayed = {
        card: play,
        userId: user.userId
      }
      this.server.to(client.data.slug).emit('cardPlayed', newPlayCard); // broadcast messages playcard
      this.server.to(client.data.user.socketId).emit('cards', await this.gameService.getDeck(client.data.slug, client.data.user)); // broadcast messages playcard
      console.log("API Carte joué -> ", play);
      if (await this.gameService.checkEndPli(client.data.slug)) {
        let [winner, bonus] = await this.gameService.newPli(client.data.slug);
        this.server.to(client.data.slug).emit('newPli', [winner, bonus]); // broadcast messages newPli

        if (await this.gameService.checkEndRound(client.data.slug)) {
          await this.gameService.endRound(client.data.slug, round);
          this.server.to(client.data.slug).emit('endRound', client.data.slug); // broadcast messages endRound
          this.server.to(client.data.slug).emit('member', await this.roomService.usersWithoutCardsInRoom(client.data.slug)); // broadcast messages endRound
          return {message: "Fin de manche bien lancée"};
        }
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
