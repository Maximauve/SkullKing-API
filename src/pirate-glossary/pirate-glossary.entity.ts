import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class PirateGlossary {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ type: 'varchar', unique: true, nullable: false })
  word: string;
}
