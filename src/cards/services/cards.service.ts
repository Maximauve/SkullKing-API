import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {Card} from "../cards.entity";
import {CreatedCardDto} from "../dto/cards.dto";
import {HttpException} from "@nestjs/common/exceptions";
import {CardTypeService} from "../../cards-types/service/cards-types.service";

@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(Card)
    private cardsRepository: Repository<Card>,
    private cardsTypesRepository: CardTypeService,
  ) {
  }

  async getAll() {
    return await this.cardsRepository.find();
  }

  async create(createCard: CreatedCardDto) {
    const {value, img_path, type} = createCard;
    const card = new Card();
    card.value = value;
    card.img_path = img_path;
    if (!await this.cardsTypesRepository.FindOneName(type.name)) throw new HttpException('Le Card Type n\'a pas été trouvé', 404);
    card.type = await this.cardsTypesRepository.FindOneName(type.name);
    return this.cardsRepository.save(card);
  }

  async delete(id: string) {
    let query = await this.cardsRepository
      .createQueryBuilder()
      .delete()
      .from(Card)
      .where("id= :id", {id: id})
      .execute();
    if (query.affected == 0) throw new HttpException("La carte n'a pas été trouvé", 404);
    return {};
  }
}
