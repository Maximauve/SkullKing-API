import {Injectable} from "@nestjs/common";
import FullCards from "../../script/cards";
import {Card} from "../../script/Card";

@Injectable()
export class GameService {
  constructor() {}

  async getCards(): Promise<{}> {
    return FullCards;
  }

  async flushCards(): Promise<Card[]> {
    let fullCards: Card[] = FullCards;
    fullCards.sort(() => Math.random() - 0.5);
    return fullCards;
  }
}