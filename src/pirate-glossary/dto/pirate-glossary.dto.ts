import {IsNotEmpty} from 'class-validator';

export class PirateGlossaryDto {
  @IsNotEmpty({message: "Le mot ne peut pas être vide"})
  word: string;
}