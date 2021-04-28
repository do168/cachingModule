import Redis from 'ioredis';
import config from 'config';

export interface CacheOption {
  host: string;
  port: number;
  baseKey?: string;
  ttl?: number;
}

class RedisService {
  private readonly redisClient: Redis.Cluster;
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

    this.redisClient = new Redis.Cluster(
      [
        {
          host: options.host,
          port: options.port,
        },
      ],
      {
        clusterRetryStrategy: function (times) {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
      },
    );
  }

  public async getCache(key: string, prefix: string): Promise<any | null> {
    const cache = await this.redisClient.get(this.createRealKey(key, prefix));
    if (cache) {
      return JSON.parse(cache);
    }
    return null;
  }
  public async setCache(key: string, value: any, prefix: string): Promise<void> {
    await this.redisClient.set(this.createRealKey(key, prefix), JSON.stringify(value), 'EX', this.redisTTL || 300);
  }
  public async deleteCache(key: string, prefix: string): Promise<void> {
    await this.redisClient.del(this.createRealKey(key, prefix));
  }
  private createRealKey(key: string, prefix: string) {
    return (this.baseKey + '/' + prefix + '/' + key).toLowerCase();
  }
  public close(): void {
    if (this.redisClient) {
      this.redisClient.disconnect();
    }
  }
}

export const redisService = new RedisService();
