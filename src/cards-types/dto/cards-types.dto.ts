import {IsEmail, IsNotEmpty, IsOptional, MinLength} from "class-validator"
import {CardType} from "../cards-types.entity";

export class CreatedCardTypeDto {
    @IsNotEmpty()
    @MinLength(1)
    name: string;

    @IsOptional()
    circular_winner: boolean = false;

    @IsOptional()
    superior_to: CreatedCardTypeDto[];
}