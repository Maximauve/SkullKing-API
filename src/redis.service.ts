import { Redis } from 'ioredis';
import {Injectable} from "@nestjs/common";

@Injectable()
export class RedisService {
  private redisClient: Redis;

  constructor() {
    this.redisClient = new Redis({
      host: 'localhost',
      port: 6379,
    });
  }

  async set(key: string, value: string): Promise<void> {
    await this.redisClient.set(key, value);
  }

  async get(key: string): Promise<string | null> {
    return this.redisClient.get(key);
  }
}