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

@WebSocketGateway({ cors : '*'})
export class RoomWebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {

  constructor(private readonly redisService: RedisService,
              private readonly roomService: RoomService) {}

  @WebSocketServer() server;

  async handleConnection(socket: Socket): Promise<void> {
    const socketId = socket.id;
    const tokenData: {username: string, id: string} = jwtDecode(socket.handshake.query.token as string); // todo: jwt decode
    socket.data.user = {
      socketId: socketId,
      username: tokenData.username,
      userId: tokenData.id,
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
  async joinRoom(@ConnectedSocket() client: Socket, @MessageBody() slug: string): Promise<{}> {
    // console.log(`API - ${client.id} is joining ${slug}`);
    try {
      if (await this.redisService.exists(`room:${slug}`)) {
        await client.join(slug);
        await this.roomService.addUserToRoom(slug, client.data.user);
        this.server.to(slug).emit('members', await this.roomService.usersInRoom(slug));
      }
    } catch (e) {
      return {
        message: e.message,
        status: e.status,
      }
    }
  }

  @SubscribeMessage('chat')
  async chat(@ConnectedSocket() client: Socket, @MessageBody() message: Message): Promise<void> {
    // console.log("API chat message -> ", message);
    this.server.to(message.slug).emit('chat', message, client.data.user); // broadcast messages
  }
}
