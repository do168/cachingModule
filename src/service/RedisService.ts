import Redis from 'ioredis';
import config from 'config';
import util from 'util';
import { ClientRequest } from 'node:http';

export interface CacheOption {
  host: string;
  port: number;
  baseKey?: string;
  ttl?: number;
}

class RedisService {
  private readonly redisClient: Redis.Redis;
  private readonly pubRedisClient: Redis.Redis;
  private readonly subRedisClient: Redis.Redis;
  private readonly baseKey?: string;
  private readonly redisTTL: number;

  constructor() {
    const options = config.get('redis') as CacheOption;
    if (options.baseKey) {
      this.baseKey = options.baseKey;
    }

    if (options.ttl) {
      this.redisTTL = options.ttl;
    }

    this.redisClient = new Redis({
      host: options.host,
      port: options.port,
    });

    this.pubRedisClient = new Redis({
      host: options.host,
      port: options.port,
    });

    this.subRedisClient = new Redis({
      host: options.host,
      port: options.port,
    });

    this.subRedisClient.setMaxListeners(25);
  }

  public async getCache(key: string, prefix: string): Promise<any | null> {
    const result = await this.redisClient.get(this.createRealKey(key, prefix));
    if (result) {
      return result;
    }
    return null;
  }
  public async setCache(key: string, value: any, prefix: string): Promise<void> {
    await this.redisClient.set(this.createRealKey(key, prefix), JSON.stringify(value), 'EX', this.redisTTL || 300);
  }
  public async deleteCache(key: string, prefix: string): Promise<void> {
    await this.redisClient.del(this.createRealKey(key, prefix));
  }

  public async pub(topic: string, message: string): Promise<void> {
    await this.pubRedisClient.publish(topic, message);
  }

  public async sub(topic: string): Promise<string> {
    let result: string = 'thisIsthis';
    this.subRedisClient.subscribe(topic, (err, count) => {
      if (err) {
        console.error('Failed to subscribe : ', err.message);
        throw new Error();
      }
      console.log(`Subscribed successfully! This client is currently subscribed to ${count} channels.`);
    });
    this.subRedisClient.on('message', (channel, message) => {
      console.log('message', channel, message);
      result = message;
    });
    return result;
  }
  private createRealKey(key: string, prefix: string) {
    return (this.baseKey + '/' + prefix + '/' + key).toLowerCase();
  }

  public async isEqual(fromRedis: string, input: string): Promise<boolean> {
    if (fromRedis === input) {
      return true;
    }
    return false;
  }
  public close(): void {
    if (this.redisClient) {
      this.redisClient.quit();
    }
  }
}

export const redisService = new RedisService();
