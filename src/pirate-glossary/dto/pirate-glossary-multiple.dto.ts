import {IsNotEmpty} from 'class-validator';

export class PirateGlossaryMultipleDto {
  @IsNotEmpty({message: "Le mot ne peut pas être vide"})
  word: string[];
}