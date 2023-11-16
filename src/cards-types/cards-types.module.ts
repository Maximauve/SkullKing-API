import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {CardType} from "./cards-types.entity";
import {CardTypeService} from "./service/cards-types.service";
import {CardTypeController} from "./controllers/cards-types.controller";

@Module({
  imports: [TypeOrmModule.forFeature([CardType])],
  controllers: [CardTypeController],
  providers: [CardTypeService],
  exports: [CardTypeService],
})
export class CardTypeModule {
}