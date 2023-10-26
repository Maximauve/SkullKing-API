import {Body, Controller, Delete, Get, Param, Post, Put, Req, UnauthorizedException} from '@nestjs/common';
import {UseGuards, UsePipes} from '@nestjs/common/decorators';
import {JwtAuthGuard} from "../../auth/guards/jwt-auth.guard";
import {PirateGlossaryService} from "../service/pirate-glossary.service";
import {PirateGlossaryDto} from "../dto/pirate-glossary.dto";
import {ValidationPipe} from "@nestjs/common/pipes";
import {PirateGlossaryMultipleDto} from "../dto/pirate-glossary-multiple.dto";
import {PirateGlossary} from "../pirate-glossary.entity";
import {HttpException} from "@nestjs/common/exceptions";


@Controller('pirate-glossary')
export class PirateGlossaryController {

  constructor(private pirateGlossaryService: PirateGlossaryService) {
  }

  @UseGuards(JwtAuthGuard)
  @Get("/")
  async GetThreeWord(): Promise<{}> {
    let words = await this.pirateGlossaryService.GetThreeWord();
    return { "room" : words };
  }

  @UseGuards(JwtAuthGuard)
  @UsePipes(ValidationPipe)
  @Post("/")
  async Create(@Body() pirateGlossary: PirateGlossaryDto | PirateGlossaryMultipleDto): Promise<PirateGlossary[] | PirateGlossary> {
    if (Array.isArray(pirateGlossary.word)) {
      let allPirates: PirateGlossary[] = [];
      for (const w of pirateGlossary.word) {
        if (await this.pirateGlossaryService.checkWord(w)) continue;
        allPirates.push(await this.pirateGlossaryService.Create({word: w} as PirateGlossaryDto));
      }
      if (allPirates.length <= 0) throw new HttpException('Words already exists', 409);
      return allPirates;
    }
    if (await this.pirateGlossaryService.checkWord(pirateGlossary.word)) throw new HttpException('Word already exists', 409);
    return this.pirateGlossaryService.Create(pirateGlossary as PirateGlossaryDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete("/:id")
  async Delete(@Param('id') id: string) {
    return await this.pirateGlossaryService.delete(id);
  }
}
