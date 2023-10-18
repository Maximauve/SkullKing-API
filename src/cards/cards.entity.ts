import {Entity, PrimaryGeneratedColumn, Column, ManyToOne} from 'typeorm';
import {CardType} from "../cards-types/cards-types.entity";

@Entity()
export class Card {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ type: 'integer', nullable: false })
  value: number;

  @ManyToOne(() => CardType, cardType => cardType.cards)
  type: CardType;
}   
