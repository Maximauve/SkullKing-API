import {Body, Controller, Delete, Get, Param, Post} from '@nestjs/common';
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

  @UseGuards(JwtAuthGuard)
  @Get('')
  async getRooms(): Promise<{}> {
    return await this.roomService.getRooms();
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:slug')
  async getRoom(@Param('slug') slug: string): Promise<{}> {
    return await this.roomService.getRoom(slug);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:slug/close')
  async closeRoom(@Param('slug') slug: string): Promise<{}> {
    return await this.roomService.closeRoom(slug);
  }
}
