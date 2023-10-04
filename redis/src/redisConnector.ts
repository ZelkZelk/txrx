import { Redis } from 'ioredis';
import { RedisConnection} from '../types/redis.types';

export default class RedisConnector {
    private static instances: { [key:string]: RedisConnector } = {};
    private pool: RedisConnection = {};

    private constructor() {};

    public static get(category: string): RedisConnector {
        if (typeof RedisConnector.instances[category] === 'undefined') {
            RedisConnector.instances[category] = new RedisConnector();
        }

        return RedisConnector.instances[category];
    }

    public get(url: string): Redis {
        if (!this.pool[url]) {
            this.pool[url] = new Redis(url);
        }

        return this.pool[url];
    }
}