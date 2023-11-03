export interface RoomModel {
  slug: string;
  password?: string;
  users: User[];
  maxPlayers: number;
  currentPlayers: number;
  host: User;
}

export interface User {
  userId: string
  username: string
  socketId: string
}