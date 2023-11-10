import {Body, Controller, Post, Get, Param, Delete} from '@nestjs/common';
import {CardTypeService} from "../service/cards-types.service";
import {UseGuards, UsePipes} from "@nestjs/common/decorators";
import {JwtAuthGuard} from "../../auth/guards/jwt-auth.guard";
import {CreatedCardTypeDto} from "../dto/cards-types.dto";
import {ValidationPipe} from "@nestjs/common/pipes";

@UseGuards(JwtAuthGuard)
@Controller('cards-types')
export class CardTypeController {

    constructor(private cardTypeService: CardTypeService) {}

    @Get("/")
    async GetAll() {
        return this.cardTypeService.getAll();
    }

    @UsePipes(ValidationPipe)
    @Post("/")
    async Create(@Body() cardType: CreatedCardTypeDto) {
        return this.cardTypeService.create(cardType);
    }

    @Delete("/:id")
    async delete(@Param('id') id: string) {
        return await this.cardTypeService.delete(id);
    }
}
