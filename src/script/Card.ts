import { type CardType } from './CardType';

export interface Card {
  type: CardType
  value?: number
  imgPath: string
}
