import {IsEmail, IsNotEmpty, IsOptional, MinLength} from "class-validator"
import { Role } from "../role.enum";

export class CreatedUsersDto {
    @IsNotEmpty()
    @MinLength(3)
    username: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    @MinLength(6)
    password: string;

    @IsOptional()
    role?: Role;
}