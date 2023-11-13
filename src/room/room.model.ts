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

export interface User {
  userId: string
  username: string
  socketId: string
  cards: Card[]
  points: number
}

export interface Play {
  card: Card
  user: User
}