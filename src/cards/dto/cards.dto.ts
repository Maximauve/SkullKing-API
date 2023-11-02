import {IsEmail, IsNotEmpty, IsOptional, MinLength} from "class-validator"
import {Column} from "typeorm";
import {CardType} from "../../cards-types/cards-types.entity";
import {CreatedCardTypeDto} from "../../cards-types/dto/cards-types.dto";

export class CreatedCardDto {
    @IsNotEmpty()
    value: number;

    @IsOptional()
    type: CreatedCardTypeDto;

    @IsNotEmpty()
    img_path: string;
}