import { Redis } from 'ioredis';

export type RedisConnection = {
    [key: string]: Redis;
};
