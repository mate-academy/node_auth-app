import type { RedisClient } from '../../services/cache.js';
import type User from '../User/User.model.js';

export default class CacheService {
  private readonly redisClient: RedisClient;
  private readonly prefix = {
    RESET_PASSWORD: 'reset-password',
  };

  constructor(redisClient: RedisClient) {
    this.redisClient = redisClient;
  }

  public async setResetPasswordToken(token: string, userId: User['id']) {
    await this.redisClient.set(`${this.prefix.RESET_PASSWORD}:${token}`, userId, {
      EX: +(process.env.RESET_PASSWORD_TOKEN_EXPIRES_IN ?? 900),
    });
  }

  public async getUserIdByResetPasswordToken(token: string) {
    const userId = await this.redisClient.get(`${this.prefix.RESET_PASSWORD}:${token}`);

    return Number(userId);
  }

  public async deleteResetPasswordToken(token: string) {
    await this.redisClient.del(`${this.prefix.RESET_PASSWORD}:${token}`);
  }
}
