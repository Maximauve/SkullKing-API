import {Body, Controller, Post} from '@nestjs/common';
import {RoomService} from "../service/room.service";
import {UseGuards, UsePipes} from "@nestjs/common/decorators";
import {JwtAuthGuard} from "../../auth/guards/jwt-auth.guard";
import {CreatedRoomDto} from "../dto/room.dto";
import {ValidationPipe} from "@nestjs/common/pipes";

@Controller('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @UseGuards(JwtAuthGuard)
  @UsePipes(ValidationPipe)
  @Post('')
  async createRoom(@Body() roomCreated: CreatedRoomDto): Promise<{}> {
    return await this.roomService.createRoom(roomCreated.maxPlayers, roomCreated?.password ?? null);
  }
}
