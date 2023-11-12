import { type Card } from './Card';
import { type CardType } from './CardType';

// Types of cards
const EscapeType: CardType = {
  name: 'Fuite',
  superior_to: []
};

const GreenType: CardType = {
  name: 'Vert',
  superior_to: [EscapeType]
};

const YellowType: CardType = {
  name: 'Jaune',
  superior_to: [EscapeType]
};

const PurpleType: CardType = {
  name: 'Violet',
  superior_to: [EscapeType]
};

const BlackType: CardType = {
  name: 'Atout',
  superior_to: [EscapeType, GreenType, YellowType, PurpleType]
};

const MermaidType: CardType = {
  name: 'Sirène',
  superior_to: [EscapeType, GreenType, YellowType, PurpleType, BlackType],
  circular_winner: true
};

const PirateType: CardType = {
  name: 'Pirate',
  superior_to: [EscapeType, GreenType, YellowType, PurpleType, BlackType, MermaidType]
};

const SkullKingType: CardType = {
  name: 'Skull King',
  superior_to: [EscapeType, GreenType, YellowType, PurpleType, BlackType, PirateType]
};

MermaidType.superior_to.push(SkullKingType);

const GreenCards: Card[] = [];
const YellowCards: Card[] = [];
const PurpleCards: Card[] = [];
const BlackCards: Card[] = [];

interface LoopUtility {
  color: string
  type: CardType
  deck: Card[]
}

const loopUtilities: LoopUtility[] = [
  { color: 'green', type: GreenType, deck: GreenCards },
  { color: 'yellow', type: YellowType, deck: YellowCards },
  { color: 'purple', type: PurpleType, deck: PurpleCards },
  { color: 'black', type: BlackType, deck: BlackCards }

];

loopUtilities.forEach((utility) => {
  for (let i = 1; i <= 14; i++) {
    utility.deck.push({
      type: utility.type,
      value: i,
      imgPath: `/assets/images/cards/${utility.color}/${i}.png`
    });
  }
});

const EscapeCards: Card[] = [];
for (let i = 1; i <= 5; i++) {
  EscapeCards.push({
    type: EscapeType,
    imgPath: '/assets/images/cards/escape.png'
  });
}

const MermaidCards: Card[] = [];
for (let i = 1; i <= 2; i++) {
  MermaidCards.push({
    type: MermaidType,
    imgPath: '/assets/images/cards/mermaid.png'
  });
}

const PirateCards: Card[] = [];
for (let i = 1; i <= 5; i++) {
  PirateCards.push({
    type: PirateType,
    imgPath: `/assets/images/cards/pirate/${i}.png`
  });
}

const SkullKing: Card = {
  type: SkullKingType,
  imgPath: '/assets/images/cards/skullKing.png'
};

const cards: Card[] = [];
cards.push(...EscapeCards);
cards.push(...GreenCards);
cards.push(...YellowCards);
cards.push(...PurpleCards);
cards.push(...BlackCards);
cards.push(...MermaidCards);
cards.push(...PirateCards);
cards.push(SkullKing);

export default cards;

// cards.forEach((card) => {
//   console.log(`o------------------------------------------------------------------o`);
//   console.log(`|                                                                  |`);
//   console.log(`| ${card.type.name + " " + (card.value ?? "") + " " + card.imgPath + " ".repeat(63 - (card.type.name.length + card.imgPath.length + (card.value !== undefined ? card.value.toString.length : 0)))}|`);
//   console.log(`|                                                            |`);
//   if (card.type.superior_to.length !== 0) {
//     console.log(`|                    ==== Is superior to : ====                    |`);
//     console.log(`|                                                                  |`);
//     card.type.superior_to.forEach((superiorCardType) => {
//       console.log(`| -> ${superiorCardType.name + ' '.repeat(62 - superiorCardType.name.length)}|`);
//       console.log(`|                                                                  |`);
//     });
//   }
//   console.log(`o------------------------------------------------------------------o`);
//   console.log(util.inspect(card, false, null, true /* enable colors */));
// });

// console.table(cards);
