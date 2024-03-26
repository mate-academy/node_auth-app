import { createClient } from 'redis';

export const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: +(process.env.REDIS_PORT ?? '6379'),
  },
});

export type RedisClient = typeof redisClient;
