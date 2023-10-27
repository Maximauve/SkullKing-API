export class RoomModel {
  slug: string;
  password?: string;
  users: string[] = [];
  maxPlayers: number;
  currentPlayers: number;
}