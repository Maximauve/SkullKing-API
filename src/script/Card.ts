import { type CardType } from './CardType';

export interface Card {
  id?: number
  type: CardType
  value?: number
  imgPath: string
}
