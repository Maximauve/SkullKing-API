import {Card} from "../script/Card";

export interface RoomModel {
  slug: string;
  password?: string;
  users: User[];
  maxPlayers: number;
  currentPlayers: number;
  host: User;
  started: boolean;
  currentRound: number;
}

export interface UserInRoom {
  userId: string
  username: string
  socketId: string
  points: number
  hasToPlay: boolean
}

export interface User extends UserInRoom {
  cards: Card[]
}

export interface UserWithHost extends UserInRoom {
  isHost: boolean
}

export interface Play {
  card: Card
  user: User
}

export interface PlayCard extends Play {
  slug: string
  nbRound: number
  nbPli: number
  card: Card
}

export interface Pli {
  slug: string
  nbRound: number
  nbPli: number
}

export interface Round {
  slug: string
  nbRound: number
}

export interface RoundModel {
  userId: string
  wins: number
  nbWins: number
  points: number
  bonus: number
  total: number
}

export interface Bet {
  slug: string
  wins: number
}

