import { Body, Controller, Post, Get } from '@nestjs/common';
import { CardsService } from '../services/cards.service';

@Controller('cards')
export class CardsController {

  constructor(private cardsService: CardsService) {}

}
