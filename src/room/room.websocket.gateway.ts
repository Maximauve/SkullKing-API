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

@WebSocketGateway(8001, { cors : '*'})
export class RoomWebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {

  constructor(private readonly redisService: RedisService,
              private readonly roomService: RoomService) {}

  @WebSocketServer() server;

  async handleConnection(socket: Socket): Promise<void> {
    const socketId = socket.id;
    const tokenData: {username: string, userId: string} = jwtDecode(socket.handshake.query.token as string); // todo: jwt decode
    socket.data.user = {
      socketId: socketId,
      username: tokenData.username,
      userId: tokenData.userId,
    };
    console.log(`New connecting... socket id:`, socketId);
  }

  async handleDisconnect(socket: Socket): Promise<void> {
    const socketId = socket.id;
    await this.roomService.removeUserFromAllRooms(socketId);
    console.log(`Disconnecting... socket id:`, socketId);
  }

  afterInit(server: any): any {
    console.log('Init');
  }

  @SubscribeMessage('joinRoom')
  async joinRoom(@ConnectedSocket() client: Socket, @MessageBody() slug: string): Promise<void> {
    console.log('Client', client);
    console.log(`${client.id} is joining ${slug}`);
    if (!await this.redisService.exists(`room:${slug}`)) {
      throw new HttpException("Room not found",  404);
    }
    await client.join(slug);
    await this.roomService.addUserToRoom(slug, client.data.user);
  }

  @SubscribeMessage('chat')
  async chat(@MessageBody() message: Message): Promise<Message> {
    console.log(message);
    this.server.to(message.slug).emit('chat', message); // broadcast messages
    return message;
  }
}
