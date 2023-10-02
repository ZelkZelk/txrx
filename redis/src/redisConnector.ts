import { Redis } from 'ioredis';
import { RedisConnection } from '../types/redis.types';

export default class RedisConnector {
    private static instance: RedisConnector;
    private pool: RedisConnection = {};

    private constructor() {};

    public static get(): RedisConnector {
        if (! RedisConnector.instance) {
            RedisConnector.instance = new RedisConnector();
        }

        return RedisConnector.instance;
    }

    public get(url: string): Redis {
        if (!this.pool[url]) {
            this.pool[url] = new Redis(url);
        }

        return this.pool[url];
    }
}