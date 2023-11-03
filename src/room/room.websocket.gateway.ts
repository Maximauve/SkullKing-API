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
import {Users} from "./room.model";
import {RoomService} from "./service/room.service";

@WebSocketGateway(8001, { cors : '*'})
export class RoomWebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {

  constructor(private readonly redisService: RedisService,
              private readonly roomService: RoomService) {}

  @WebSocketServer() server;

  @SubscribeMessage('message')
  async handleMessage(@MessageBody() message: string): Promise<void> {
    console.log(message);
    await this.server.emit('message', message);
  }

  async handleConnection(socket: Socket): Promise<void> {
    const socketId = socket.id;
    console.log(`New connecting... socket id:`, socketId);
  }

  async handleDisconnect(socket: Socket): Promise<void> {
    const socketId = socket.id;
    await this.roomService.removeUserFromAllRooms(socketId)
    console.log(`Disconnecting... socket id:`, socketId);
  }

  afterInit(server: any): any {
    console.log('Init');
  }

  @SubscribeMessage('joinRoom')
  async handleParticipants(@ConnectedSocket() client: Socket, @MessageBody() payload: { slug: string, user: Users }): Promise<void> {
    console.log('Client', client);
    console.log(`${payload.user.socketId} is joining ${payload.slug}`)
    if (await this.redisService.exists(`room:${payload.slug}`) == 0) {
      throw new HttpException("Room not found",  404);
    }
    if (payload.user.socketId) {
      await this.server.in(payload.user.socketId).socketsJoin(payload.slug)
      await this.roomService.addUserToRoom(payload.slug, payload.user)
    }
  }
}
