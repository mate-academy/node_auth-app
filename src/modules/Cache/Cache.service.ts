import type { RedisClient } from '../../services/cache.js';

export default class CacheService {
  private readonly redisClient: RedisClient;
  private readonly prefix = {
    RESET_PASSWORD: 'reset-password',
    EMAIL_CHANGE: 'email-change',
  };

  constructor(redisClient: RedisClient) {
    this.redisClient = redisClient;
  }

  public async set(prefix: string, key: string, value: unknown, expiresInSeconds?: number) {
    const cacheValue = JSON.stringify(value);

    await this.redisClient.set(`${prefix}:${key}`, cacheValue, { EX: expiresInSeconds });
  }

  public async get<T>(prefix: string, key: string) {
    const value = await this.redisClient.get(`${prefix}:${key}`);

    return value !== null ? (JSON.parse(value) as T) : null;
  }

  public async delete(prefix: string, key: string) {
    await this.redisClient.del(`${prefix}:${key}`);
  }
}
