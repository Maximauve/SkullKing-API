import {IsNotEmpty, IsOptional} from "class-validator"
import {CreatedCardTypeDto} from "../../cards-types/dto/cards-types.dto";

export class CreatedCardDto {
  @IsNotEmpty({message: "La valeur ne peut pas être vide"})
  value: number;

  @IsOptional()
  type: CreatedCardTypeDto;

  @IsNotEmpty({message: "Le chemin de l'image ne peut pas être vide"})
  img_path: string;
}