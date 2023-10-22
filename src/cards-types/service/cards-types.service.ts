import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {CardType} from "../cards-types.entity";
import {CreatedCardTypeDto} from "../dto/cards-types.dto";
import {HttpException} from "@nestjs/common/exceptions";
import {Card} from "../../cards/cards.entity";

@Injectable()
export class CardTypeService {
    constructor(
      @InjectRepository(CardType)
      private cardTypeRepository: Repository<CardType>,
    ) {
    }

    async getAll() {
        return await this.cardTypeRepository
          .createQueryBuilder("card_type")
          .innerJoinAndSelect("card_type.superior_to", "card_type_superior_to_card_type")
          .getMany();
    }

    async FindOneName(name: string): Promise<CardType> {
        return await this.cardTypeRepository
          .createQueryBuilder("card_type")
          .where("card_type.name = :name", {name: name})
          .getOne()
    }

    async create(createCardType: CreatedCardTypeDto) {
        const {name, superior_to, circular_winner} = createCardType;
        const cardType = new CardType();
        cardType.name = name;
        cardType.circular_winner = circular_winner;
        if (await this.checkName(name)) throw new HttpException('CardType already exists', 409);
        if (superior_to && superior_to.length > 0) {
            cardType.superior_to = await Promise.all(
              superior_to.map(dto => this.FindOneName(dto.name))
            );
        }
        return this.cardTypeRepository.save(cardType);
    }

    async checkName(name: string) {
        const cardType = await this.FindOneName(name);
        if (cardType) return true;
        return false;
    }

    async delete(id: string) {
        let query = await this.cardTypeRepository
          .createQueryBuilder()
          .delete()
          .from(CardType)
          .where("id= :id", { id: id })
          .execute();
        if (query.affected == 0) throw new HttpException("Card Type not found",  404);
        return {};
    }
}