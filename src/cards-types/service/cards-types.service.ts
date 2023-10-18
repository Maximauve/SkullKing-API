import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {CardType} from "../cards-types.entity";

@Injectable()
export class CardTypeService {
    constructor(
        @InjectRepository(CardType)
        private cardTypeRepository: Repository<CardType>,
    ) {}
}



/*
const newCardType = new CardType();
newCardType.name = "CardTypeA";
newCardType.superiorTo = [cardTypeB, cardTypeC]; // cardTypeB et cardTypeC sont des types supérieurs de cardTypeA
await cardTypeRepository.save(newCardType);
*/