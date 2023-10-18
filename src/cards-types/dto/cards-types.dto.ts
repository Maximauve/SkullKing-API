import { IsEmail, IsNotEmpty, MinLength } from "class-validator"

export class CreatedCardTypeDto {
    @IsNotEmpty()
    @MinLength(3)
    username: string;
}