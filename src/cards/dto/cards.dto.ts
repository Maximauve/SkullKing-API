import { IsEmail, IsNotEmpty, MinLength } from "class-validator"
import {Column} from "typeorm";

export class CreatedCardDto {
    @IsNotEmpty()
    @MinLength(3)
    username: string;
}