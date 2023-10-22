import {Body, Controller, Post, Get, Param, Delete} from '@nestjs/common';
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
    async GetAll() {
        return this.cardTypeService.getAll();
    }

    @UsePipes(ValidationPipe)
    @UseGuards(JwtAuthGuard)
    @Post("/")
    async Create(@Body() cardType: CreatedCardTypeDto) {
        return this.cardTypeService.create(cardType);
    }

    @UseGuards(JwtAuthGuard)
    @Delete("/:id")
    async delete(@Param('id') id: string) {
        return await this.cardTypeService.delete(id);
    }
}
