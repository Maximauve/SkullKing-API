import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {PirateGlossary} from "../pirate-glossary.entity";
import {PirateGlossaryDto} from "../dto/pirate-glossary.dto";
import {PirateGlossaryController} from "../controller/pirate-glossary.controller";
import {HttpException} from "@nestjs/common/exceptions";

@Injectable()
export class PirateGlossaryService {
  constructor(
    @InjectRepository(PirateGlossary)
    private pirateGlossaryRepository: Repository<PirateGlossary>,
  ) {}

  async GetThreeWord(): Promise<string> {
    const allWords = await this.pirateGlossaryRepository.find();
    if (allWords.length < 3) throw new HttpException('Not enough words in the database', 404);
    return pickRandomElements(allWords);
  }

  async FindOneWord(word: string): Promise<PirateGlossary> {
    return await this.pirateGlossaryRepository
      .createQueryBuilder("pirate_glossary")
      .where("pirate_glossary.word = :word", {word: word})
      .getOne()
  }

  async Create(pirateGlossary: PirateGlossaryDto): Promise<PirateGlossary> {
    const newPirateGlossary = this.pirateGlossaryRepository.create(pirateGlossary);
    return this.pirateGlossaryRepository.save(newPirateGlossary);
  }

  async checkWord(word: string): Promise<boolean> {
    const pirateGlossary = await this.FindOneWord(word);
    return !!pirateGlossary;
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
