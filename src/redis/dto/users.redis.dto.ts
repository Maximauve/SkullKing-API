import {IsEmail, IsNotEmpty, MinLength} from "class-validator"

export class UserRedisDto {
  @IsNotEmpty()
  @MinLength(3)
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;
}