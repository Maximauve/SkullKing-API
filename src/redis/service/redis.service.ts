import { Redis } from 'ioredis';
import {Injectable} from "@nestjs/common";

@Injectable()
export class RedisService {
  private redisClient: Redis;

  constructor() {
    this.redisClient = new Redis({
      port: parseInt(process.env.REDIS_PORT),
      host: process.env.REDIS_HOST,
      username: process.env.REDIS_USERNAME,
      password: process.env.REDIS_PASSWORD,
      db: 0,
      tls: {
        host: process.env.REDIS_HOST,
        rejectUnauthorized: false,
        requestCert: true,
      },
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

  async hget(key: string, field: string): Promise<string | null> {
    return this.redisClient.hget(key, field);
  }

  async hgetall(key: string): Promise<{[key: string]: string}> {
    return this.redisClient.hgetall(key);
  }

  async exists(key: string): Promise<number> {
    return this.redisClient.exists(key);
  }

  async keys(pattern: string): Promise<string[]> {
    return this.redisClient.keys(pattern);
  }

  async del(key: string): Promise<void> {
    await this.redisClient.del(key);
  }
}
