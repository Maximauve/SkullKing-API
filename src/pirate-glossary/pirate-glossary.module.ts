import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {PirateGlossary} from "./pirate-glossary.entity";
import {PirateGlossaryController} from "./controller/pirate-glossary.controller";
import {PirateGlossaryService} from "./service/pirate-glossary.service";

@Module({
  imports: [TypeOrmModule.forFeature([PirateGlossary])],
  controllers: [PirateGlossaryController],
  providers: [PirateGlossaryService],
  exports: [PirateGlossaryService],
})
export class PirateGlossaryModule {
}