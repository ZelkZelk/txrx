import { P2PMapping, P2PMode } from './../types/p2p.types';
import { Consumable, ConsumeItem } from 'consumer/types/consumer.types';
import { Consumer } from "consumer";
import { Streamer } from 'streamer';
import Registry from './registry';
import Shard from './shard';
import { Subject, Subscription } from 'rxjs';

export default class P2P {
    private static p2p?: P2P;
    private consumer: Consumer;
    private streamer: Streamer;
    private running = true;
    private mapping: P2PMapping = {};
    private initialized = false;
    private emitter: Subject<P2PMapping>;
    private mode: P2PMode;

    private constructor(url: string) {
        this.consumer = new Consumer(url);
        this.streamer = new Streamer(url);
        this.emitter = new Subject();
    }

    public subscribe(fn: (P2PMapping) => Promise<void>): Subscription {
        return this.emitter.subscribe(fn);
    }

    private peer(): string {
        return  process.env.P2P_PEER!;
    }

    public isMe(item: ConsumeItem): boolean {
        const peer = item.payload.peer;

        return peer === this.peer();
    }

    public static async get(): Promise<P2P> {
        if (!P2P.p2p) {
            P2P.p2p = new P2P(process.env.REDIS_P2P!);
        }

        return P2P.p2p;
    }

    private consumable(): Consumable {
        return {
            block: 1000,
            count: 100,
            stream: process.env.P2P!,
            id: '$',
        };
    }

    public resolve(event: string): string | null {
        return this.mapping[event];
    }

    public get(): P2PMapping {
        return this.mapping;
    }

    public add(event: string, stream: string): void {
        this.mapping[event] = stream;
        this.emitter.next(this.mapping);
    }

    public del(event: string): void {
        delete this.mapping[event];
        this.emitter.next(this.mapping);
    }

    public async hello(): Promise<string | null> {
        const message = {
            stream: process.env.P2P!,
            id: '*',
            payload: {
                event: 'hello',
                peer: this.peer(),
            },
            maxlen: parseInt(process.env.P2P_MAXLEN!),
        };

        return this.streamer.stream(message);
    }

    public async init(): Promise<string | null> {
        const message = {
            stream: process.env.P2P!,
            id: '*',
            payload: {
                event: 'init',
                peer: this.peer(),
            },
            maxlen: parseInt(process.env.P2P_MAXLEN!),
        };

        return this.streamer.stream(message);
    }

    public async share(): Promise<string> {
        const shard = await Shard.get();
        const message = {
            stream: process.env.P2P!,
            id: '*',
            payload: {
                event: 'share',
                peer: this.peer(),
                shard: shard.serialize(),
            },
            maxlen: parseInt(process.env.P2P_MAXLEN!),
        };

        return this.streamer.stream(message);
    }

    public async listener(): Promise<void> {
        this.mode = P2PMode.LISTENER;

        return this.run();
    }

    public async broadcaster(): Promise<void> {
        this.mode = P2PMode.BROADCASTER;
        
        return this.run();
    }

    private async run(): Promise<void> {
        const consumable = this.consumable();
        const startAt = Date.now() - parseInt(process.env.TTL!);

        while (this.running) {
            const items: ConsumeItem[] = await this.consumer.consume(consumable);

            for await(const item of items) {
                try {
                    const payload = item.payload;
                    
                    if (!Object.hasOwn(payload, 'event')) {
                        continue;
                    }

                    if (!Object.hasOwn(payload, 'peer')) {
                        continue;
                    }
            
                    const event = item.payload.event;
                    const handler = (await Registry.get()).compute(event);

                    if (handler) {
                        await handler(item);
                    } else {
                        console.info('P2P', 'Unknown event', event);
                    }
                } catch (e) {
                    console.error(e);
                }
                    
                consumable.id = item.id;
            }

            if (!this.initialized) {
                consumable.id = startAt + '';
                this.initialized = true;
                await this.init();
            }
        }
    }
    public runningAs(): P2PMode {
        return this.mode;
    }
}   