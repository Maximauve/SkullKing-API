import {IsNotEmpty, IsOptional, MinLength} from "class-validator"

export class CreatedCardTypeDto {
  @IsNotEmpty({message: "Le nom ne peut pas être vide"})
  @MinLength(1, {message: "Le nom doit contenir au moins 1 caractère"})
  name: string;

  @IsOptional()
  circular_winner: boolean = false;

  @IsOptional()
  superior_to: CreatedCardTypeDto[];
}