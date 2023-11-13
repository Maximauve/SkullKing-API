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
import {Pli, Round} from "./room.model";

@WebSocketGateway({ cors : '*', namespace: 'room'})
export class RoomWebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {

  constructor(private readonly redisService: RedisService,
              private readonly roomService: RoomService) {}

  @WebSocketServer() server;

  handleConnection(socket: Socket): void {
    const socketId = socket.id;
    const tokenData: {username: string, id: string} = jwtDecode(socket.handshake.query.token as string); // todo: jwt decode
    socket.data.user = {
      socketId: socketId,
      username: tokenData.username,
      userId: tokenData.id,
    };
    console.log(`New connecting... socket id:`, socketId);
  }

  handleDisconnect(socket: Socket): void {
    console.log(`Disconnecting... socket id:`, socket.id);
  }

  @SubscribeMessage('joinRoom')
  async joinRoom(@ConnectedSocket() client: Socket, @MessageBody() slug: string): Promise<{}> {
    console.log(`API - ${client.data.user.username} is joining ${slug}`)
    try {
      if (await this.redisService.exists(`room:${slug}`)) {
        this.roomService.addUserToRoom(slug, client.data.user).then(() => {
          client.join(slug);
          this.server.to(slug).emit('members', this.roomService.usersInRoom(slug));
        })
        .catch((e) => {
          console.log(e)
          throw new HttpException(e.message, e.status);
        });
      } else {
        throw new HttpException("La room n'existe pas", 404);
      }
    } catch (e) {
      return {
        message: e.message,
        status: e.status,
      }
    }
  }

  @SubscribeMessage('chat')
  chat(@ConnectedSocket() client: Socket, @MessageBody() message: Message): void {
    // console.log("API chat message -> ", message);
    this.server.to(message.slug).emit('chat', message, client.data.user); // broadcast messages
  }

  @SubscribeMessage('startGame')
  async startGame(@ConnectedSocket() client: Socket, @MessageBody() slug: string): Promise<{}> {
    console.log(`API - ${client.data.user.username} is starting ${slug}`)
    try {
      if (await this.redisService.exists(`room:${slug}`)) {
        this.roomService.startGame(slug, client.data.user).then((users) => {
          for (const user of users) {
            this.server.to(user.socketId).emit('cards', user.cards);
          }
          this.server.to(slug).emit('gameStarted', slug); // broadcast messages gameStarted
        })
        .catch((e) => {
          console.log(e)
          throw new HttpException(e.message, e.status);
        });
      } else {
        throw new HttpException("La room n'existe pas", 404);
      }
    } catch (e) {
      return {
        message: e.message,
        status: e.status,
      }
    }
  }

  @SubscribeMessage('newRound')
  async newRound(@ConnectedSocket() client: Socket, @MessageBody() body : { slug: string, nbCards: number }): Promise<{}> {
    try {
      if (await this.redisService.exists(`room:${body.slug}`)) {
        this.roomService.newRound(body).then((users) => {
          for (const user of users) {
            this.server.to(user.socketId).emit('cards', user.cards);
          }
          this.server.to(body.slug).emit('newRound', body.slug); // broadcast messages newRound
        })
        .catch((e) => {
          console.log(e)
          throw new HttpException(e.message, e.status);
        });
      } else {
        throw new HttpException("La room n'existe pas", 404);
      }
    } catch (e) {
      return {
        message: e.message,
        status: e.status,
      }
    }
  }

  @SubscribeMessage('endRound')
  async endRound(@ConnectedSocket() client: Socket, @MessageBody() round : Round): Promise<{}> {
    try {
      if (await this.redisService.exists(`room:${round.slug}`)) {
        this.roomService.endRound(round).then((users) => {
          this.server.to(round.slug).emit('endRound', users); // broadcast messages endRound
        })
        .catch((e) => {
          console.log(e)
          throw new HttpException(e.message, e.status);
        });
      } else {
        throw new HttpException("La room n'existe pas", 404);
      }
    } catch (e) {
      return {
        message: e.message,
        status: e.status,
      }
    }
  }

  @SubscribeMessage('newPli')
  async newPli(@ConnectedSocket() client: Socket, @MessageBody() pli : Pli): Promise<{}> {
    try {
      if (await this.redisService.exists(`room:${pli.slug}`)) {
        this.roomService.newPli(pli).then(([winner, bonus]) => {
          this.server.to(pli.slug).emit('newPli', [winner, bonus]); // broadcast messages newPli
        })
        .catch((e) => {
          console.log(e)
          throw new HttpException(e.message, e.status);
        });
      } else {
        throw new HttpException("La room n'existe pas", 404);
      }
    } catch (e) {
      return {
        message: e.message,
        status: e.status,
      }
    }
  }
}
