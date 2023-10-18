import {Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable} from 'typeorm';
import {Card} from "../cards/cards.entity";

@Entity()
export class CardType {
    @PrimaryGeneratedColumn()
    id: string;

    @Column({ type: 'varchar', nullable: false })
    name: string;

    @Column({ type: 'boolean' })
    circular_winner: boolean;

    @ManyToMany(() => CardType, (superiorType) => superiorType.superiorTo)
    @JoinTable()
    superiorTo: CardType[];

    @OneToMany(() => Card, card => card.type)
    cards: Card[];
}
