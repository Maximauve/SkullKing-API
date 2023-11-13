import {Card} from "../script/Card";

export interface RoomModel {
  slug: string;
  password?: string;
  users: User[];
  maxPlayers: number;
  currentPlayers: number;
  host: User;
  started: boolean;
}

export interface UserInRoom {
  userId: string
  username: string
  socketId: string
  points: number
}

export interface User extends UserInRoom {
  cards: Card[]
}

export interface Play {
  card: Card
  user: User
}

export interface PlayCard extends Play {
  slug: string
  nbRound: number
  nbPli: number
}

export interface Pli {
  plays: Play[]
  slug: string
  nbRound: number
  nbPli: number
}

export interface Round {
  slug: string
  nbRound: number
}