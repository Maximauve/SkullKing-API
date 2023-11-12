export interface CardType {
  id?: number
  name: string
  superior_to: CardType[]
  circular_winner?: boolean
}
