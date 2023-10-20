import {Body, Controller, Delete, Get, Param, Post, Put, Req, UnauthorizedException} from '@nestjs/common';
import {UseGuards, UsePipes} from '@nestjs/common/decorators';
import {JwtAuthGuard} from "../../auth/guards/jwt-auth.guard";
import {PirateGlossaryService} from "../service/pirate-glossary.service";
import {PirateGlossaryDto} from "../dto/pirate-glossary.dto";
import {ValidationPipe} from "@nestjs/common/pipes";


@Controller('pirate-glossary')
export class PirateGlossaryController {

  constructor(private pirateGlossaryService: PirateGlossaryService) {
  }

  @UseGuards(JwtAuthGuard)
  @Get("/")
  GetThreeWord(): {} {
    return this.pirateGlossaryService.GetThreeWord();
  }

  @UseGuards(JwtAuthGuard)
  @UsePipes(ValidationPipe)
  @Post("/")
  async Create(@Body() pirateGlossary: PirateGlossaryDto): Promise<{}> {
    return this.pirateGlossaryService.Create(pirateGlossary);
  }
}
