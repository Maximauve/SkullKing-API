import {Body, Controller, Post, Get, Param} from '@nestjs/common';
import {CardTypeService} from "../service/cards-types.service";
import {UseGuards, UsePipes} from "@nestjs/common/decorators";
import {JwtAuthGuard} from "../../auth/guards/jwt-auth.guard";
import {CreatedCardTypeDto} from "../dto/cards-types.dto";
import {ValidationPipe} from "@nestjs/common/pipes";

@Controller('cards-types')
export class CardTypeController {

    constructor(private cardTypeService: CardTypeService) {}

    @UseGuards(JwtAuthGuard)
    @Get("/")
    async getAll() {
        return this.cardTypeService.getAll();
    }

    @UsePipes(ValidationPipe)
    @UseGuards(JwtAuthGuard)
    @Post("/")
    async create(@Body() cardType: CreatedCardTypeDto) {
        return this.cardTypeService.create(cardType);
    }
}
