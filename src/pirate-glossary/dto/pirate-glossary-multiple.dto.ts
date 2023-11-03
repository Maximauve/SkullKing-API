import { IsNotEmpty, } from 'class-validator';

export class PirateGlossaryMultipleDto {
  @IsNotEmpty()
  word: string[];
}