import { Injectable, OnModuleDestroy } from '@nestjs/common';
import 'dotenv/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private client: Redis;
  constructor() {
    this.client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  }

  async set(key: string, value: string, expireInSeconds?: number) {
    if (expireInSeconds) {
      await this.client.set(key, value, 'EX', expireInSeconds);
    } else {
      await this.client.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  async onModuleDestroy() {
    await this.client.disconnect();
  }
}
