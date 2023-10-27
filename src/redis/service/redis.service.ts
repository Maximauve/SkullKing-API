import { Redis } from 'ioredis';
import {Injectable} from "@nestjs/common";

@Injectable()
export class RedisService {
  private redisClient: Redis;

  constructor() {
    this.redisClient = new Redis({
      host: process.env.REDIS_HOST,
      port: +process.env.REDIS_PORT,
    });
  }

  async set(key: string, value: string): Promise<void> {
    await this.redisClient.set(key, value);
  }

  async get(key: string): Promise<string | null> {
    return this.redisClient.get(key);
  }

  async hset(key: string, fieldAndValues: string[]): Promise<void> {
    if (fieldAndValues.length % 2 !== 0) throw new Error("Le nombre d'arguments doit être pair.");
    await this.redisClient.hset(key, ...fieldAndValues);
  }

  async exists(key: string): Promise<number> {
    return this.redisClient.exists(key);
  }
}