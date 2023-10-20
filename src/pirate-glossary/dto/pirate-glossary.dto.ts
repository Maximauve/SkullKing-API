import { IsNotEmpty, } from 'class-validator';

export class PirateGlossaryDto {
  @IsNotEmpty()
  word: string;
}