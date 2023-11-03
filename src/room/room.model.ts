export interface RoomModel {
  slug: string;
  password?: string;
  users: Users[];
  maxPlayers: number;
  currentPlayers: number;
  host: Users;
}

export interface Users {
  userId: string
  username: string
  socketId: string
}