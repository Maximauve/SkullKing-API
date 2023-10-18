import { Body, Controller, Post, Get } from '@nestjs/common';
import {CardTypeService} from "../service/cards-types.service";

@Controller('cards-types')
export class CardTypeController {

    constructor(private cardTypeService: CardTypeService) {}

}
