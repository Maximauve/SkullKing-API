import {IsInt, IsNotEmpty, IsOptional, Max, Min} from "class-validator";
import {User} from "../room.model";

export class CreatedRoomDto {
  @IsNotEmpty()
  @IsInt()
  @Min(2)
  @Max(8)
  maxPlayers: number;

  @IsOptional()
  password?: string;

  @IsNotEmpty()
  host: User;
}

export class RoomDto {
  slug : string;
}

export class Message {
  timeSent: string;
  message: string;
  slug: string;
}