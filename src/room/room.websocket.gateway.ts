import {OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway} from '@nestjs/websockets';
import {Socket} from 'socket.io';

@WebSocketGateway()
export class RoomWebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
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

  @SubscribeMessage('partipants')
  handleParticipants(client: any, payload: any): string {
    return 'Hello world!';
  }
}
