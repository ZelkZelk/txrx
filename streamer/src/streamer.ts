import { RedisConnector } from 'redis';
import { Streamable } from './../types/streamer.types';
import { Redis } from "ioredis";

export default class Streamer {
    private redis: Redis;

    constructor(private url: string) {
        this.redis = RedisConnector.get().get(url);
    }

    public async stream(what: Streamable) {
        return this.redis.xadd(what.stream, 'MAXLEN', '~', what.maxlen, what.id, ...Object.keys(what.payload).map((k) => {
            return [k, what.payload[k]]
        }).flat());
    }
}
