import { Consumable, ConsumeItem, Consumption, Disposable, PendingItem } from './../types/consumer.types';
import { Redis } from "ioredis";
import { RedisConnector } from "redis";

export default class Consumer {
    private redis: Redis;

    constructor(private url: string) {
        this.redis = RedisConnector.get().get(url);
    }

    public async createGroup(what: Consumable) {
        return this.redis.xgroup('CREATE', what.stream, what.group, '$', 'MKSTREAM');
    }

    public async ack(what: Consumable, which: ConsumeItem | string[]) {
        if (Object.hasOwn(which,'id')) {
            const w = which as ConsumeItem;
            return this.redis.xack(w.stream, what.group, w.id);
        }

        return this.redis.xack(what.stream, what.group, ...(which as string[]));
    }

    public async pending(what: Disposable): Promise<PendingItem[]> {
        return this.redis.xpending(what.stream, what.group, 'IDLE', what.idle, what.min, what.max, what.count, what.consumer) as unknown as PendingItem[];
    }

    public async delete(stream: string, id: string[]): Promise<number> {
        return this.redis.xdel(stream, ...id);
    }

    public async consume(what: Consumable): Promise<ConsumeItem[]> {
        let items: Consumption[];

        if (what.consumer && what.group) {
            items = await this.redis.xreadgroup(
                'GROUP', 
                what.group, 
                what.consumer, 
                'COUNT', 
                what.count, 
                'BLOCK',
                what.block, 
                'STREAMS', 
                what.stream, 
                what.id
            ) as Consumption[] ?? [];
        } else {
            items = await this.redis.xread(
                'COUNT', 
                what.count, 
                'BLOCK',
                what.block, 
                'STREAMS', 
                what.stream, 
                what.id
            ) as Consumption[] ?? [];
        }

        const consumeItems: ConsumeItem[] = [];

        for (const item of items) {
            const [stream, messages] = item as [string, Consumption];

            for (const message of messages) {
                const [id, payload] = message as [string, string[] | null];

                const entries = (payload ?? [] as string[]).flatMap((_, i, a) => {
                    return i % 2 ? [] : [a.slice(i, i + 2)];
                });
                
                consumeItems.push({
                    stream,
                    id,
                    payload: Object.fromEntries([...entries])
                });
            }   
        }

        return consumeItems;
    }
}
