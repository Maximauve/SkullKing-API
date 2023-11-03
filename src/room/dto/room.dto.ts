import {IsInt, IsNotEmpty, IsOptional, Max, Min} from "class-validator";
import {Users} from "../room.model";

export class CreatedRoomDto {
  @IsNotEmpty()
  @IsInt()
  @Min(2)
  @Max(8)
  maxPlayers: number;

  @IsOptional()
  password?: string;

  @IsNotEmpty()
  host: Users;
}

export class RoomDto {
  slug : string;
}