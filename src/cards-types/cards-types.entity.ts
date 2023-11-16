import {Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable} from 'typeorm';
import {Card} from "../cards/cards.entity";

@Entity()
export class CardType {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({type: 'varchar', nullable: false, unique: true})
  name: string;

  @Column({type: 'boolean', nullable: true})
  circular_winner: boolean;

  @ManyToMany(() => CardType, (superiorType) => superiorType.superior_to)
  @JoinTable()
  superior_to: CardType[];

  @OneToMany(() => Card, card => card.type)
  cards: Card[];
}
