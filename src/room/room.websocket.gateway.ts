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

@WebSocketGateway()
export class RoomWebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {

  constructor(private readonly redisService: RedisService) {}

  @WebSocketServer() server;

  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    return 'Hello world!';
  }

  handleConnection(socket: Socket): void {
    const socketId = socket.id;
    console.log(`New connecting... socket id:`, socketId);
  }

  handleDisconnect(socket: Socket): void {
    const socketId = socket.id;
    console.log(`Disconnecting... socket id:`, socketId);
  }

  afterInit(server: any): any {
    console.log('Init');
  }

  @SubscribeMessage('joinRoom')
  async handleParticipants(@ConnectedSocket() client: Socket, @MessageBody() slug: string): Promise<string[]> {
    console.log('Client', client);
    if (await this.redisService.exists(`room:${slug}`) == 0) {
      throw new HttpException("Room not found",  404);
    }
    let users = await this.redisService.hget(`room:${slug}`, 'users');
    if (!users) users = '[]';
    let usersTab: string[];
    usersTab = [...JSON.parse(users), client.id];
    await this.redisService.hset(`room:${slug}`, ['users', JSON.stringify(usersTab)]);
    return usersTab;
  }
}
