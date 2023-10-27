import {IsInt, IsNotEmpty, IsOptional, Max, Min} from "class-validator";

export class CreatedRoomDto {
  @IsNotEmpty()
  @IsInt()
  @Min(2)
  @Max(8)
  maxPlayers: number;

  @IsOptional()
  password?: string;
}