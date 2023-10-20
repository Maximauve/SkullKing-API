import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {PirateGlossary} from "../pirate-glossary.entity";
import {PirateGlossaryDto} from "../dto/pirate-glossary.dto";
import {PirateGlossaryController} from "../controller/pirate-glossary.controller";

@Injectable()
export class PirateGlossaryService {
  constructor(
    @InjectRepository(PirateGlossary)
    private usersRepository: Repository<PirateGlossary>,
  ) {}

  async GetThreeWord(): Promise<string> {
    return pickRandomElements(await this.usersRepository.find());
  }

  async Create(pirateGlossary: PirateGlossaryDto): Promise<PirateGlossary> {
    const newPirateGlossary = this.usersRepository.create(pirateGlossary);
    return this.usersRepository.save(newPirateGlossary);
  }
}

function pickRandomElements(arr: PirateGlossary[]): string {
  const randomElements: PirateGlossary[] = [];
  const shuffledArray = [...arr];

  while (randomElements.length < 3) {
    randomElements.push(shuffledArray.splice(Math.floor(Math.random() * shuffledArray.length), 1)[0]);
  }
  return randomElements.map((element) => element.word).join('-');
}
