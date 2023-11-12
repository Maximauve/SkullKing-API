import {Injectable} from "@nestjs/common";
import FullCards from "../../script/cards";
import {stringify, toJSON, parse} from 'flatted';
@Injectable()
export class GameService {
  constructor() {}

  async getCards(): Promise<{}> {
    console.log(parse(stringify(FullCards)))
    return parse(stringify(FullCards));
  }
}