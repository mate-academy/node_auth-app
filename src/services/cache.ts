import { createClient } from 'redis';

export const redisClient = createClient({
  password: process.env.REDIS_PASSWORD ?? 'WllM8NGdOK4F5cvvWqP9SpIoMnnlZirZ',
  socket: {
    host: process.env.REDIS_HOST ?? 'redis-18295.c300.eu-central-1-1.ec2.cloud.redislabs.com',
    port: +(process.env.REDIS_PORT ?? 18295),
  },
});

export type RedisClient = typeof redisClient;
