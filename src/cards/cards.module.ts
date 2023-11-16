import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Card} from "./cards.entity";
import {CardsService} from "./services/cards.service";
import {CardsController} from "./controllers/cards.controller";
import {CardTypeModule} from "../cards-types/cards-types.module";

@Module({
  imports: [TypeOrmModule.forFeature([Card]), CardTypeModule],
  controllers: [CardsController],
  providers: [CardsService],
  exports: [CardsService],
})
export class CardsModule {
}