import { Body, Controller, Post, Get } from '@nestjs/common';
import { CardsService } from '../services/cards.service';
import {UseGuards, UsePipes} from "@nestjs/common/decorators";
import {JwtAuthGuard} from "../../auth/guards/jwt-auth.guard";
import {CreatedCardDto} from "../dto/cards.dto";
import {ValidationPipe} from "@nestjs/common/pipes";

@Controller('cards')
export class CardsController {

  constructor(private cardsService: CardsService) {}

  @UseGuards(JwtAuthGuard)
  @Get("/")
  async getAll() {
      return await this.cardsService.getAll();
  }

  @UsePipes(ValidationPipe)
  @UseGuards(JwtAuthGuard)
  @Post("/")
  async create(@Body() card: CreatedCardDto) {
      return await this.cardsService.create(card);
  }
}
