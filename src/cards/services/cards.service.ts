import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {Card} from "../cards.entity";

@Injectable()
export class CardsService {
    constructor(
      @InjectRepository(Card)
      private cardsRepository: Repository<Card>,
    ) {}
}
