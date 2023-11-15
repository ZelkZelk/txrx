import { P2PMapping, P2PMode } from './../types/p2p.types';
import { Consumable, ConsumeItem } from 'consumer/types/consumer.types';
import { Consumer } from "consumer";
import { Streamer } from 'streamer';
import Registry from './registry';
import Shard from './shard';
import { Subject, Subscription } from 'rxjs';
import { Instrumentation } from 'telemetry';
import { Propagation } from 'telemetry/types/telemetry.types';
import Span from 'telemetry/src/artifacts/span';

export default class P2P {
    private static p2p?: P2P;
    private consumer: Consumer;
    private streamer: Streamer;
    private running = true;
    private mapping: P2PMapping = {};
    private initialized = false;
    private emitter: Subject<P2PMapping>;
    private mode: P2PMode;
    private span: Span;

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
        const startAt = Date.now();

        return {
            block: 1000,
            count: 100,
            stream: process.env.P2P!,
            id: startAt + '',
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

    public async hello(parent?: Span): Promise<string | null> {
        const span = Instrumentation.producer('p2p:tx:hello', parent ?? this.span);
        const propagation = Instrumentation.propagate(span);
        const message = {
            stream: process.env.P2P!,
            id: '*',
            payload: {
                event: 'hello',
                peer: this.peer(),
                ...propagation,
            },
            maxlen: parseInt(process.env.P2P_MAXLEN!),
        };

        const id = this.streamer.stream(message);

        Instrumentation.end(span);

        return id;
    }

    public async init(parent?: Span): Promise<string | null> {
        const span = Instrumentation.producer('p2p:tx:init', parent ?? this.span);
        const propagation = Instrumentation.propagate(span);
        const message = {
            stream: process.env.P2P!,
            id: '*',
            payload: {
                event: 'init',
                peer: this.peer(),
                ...propagation,
            },
            maxlen: parseInt(process.env.P2P_MAXLEN!),
        };

        const id = this.streamer.stream(message);

        Instrumentation.end(span);

        return id;
    }

    public async share(parent?: Span): Promise<string> {
        const span = Instrumentation.producer('p2p:tx:share', parent ?? this.span);
        const propagation = Instrumentation.propagate(span);
        const shard = await Shard.get();
        const message = {
            stream: process.env.P2P!,
            id: '*',
            payload: {
                event: 'share',
                peer: this.peer(),
                shard: shard.serialize(),
                ...propagation
            },
            maxlen: parseInt(process.env.P2P_MAXLEN!),
        };

        span.attr('shard', Object.keys(this.mapping).sort());

        const id = this.streamer.stream(message);

        Instrumentation.end(span);

        return id;
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
        const mode = this.mode === P2PMode.LISTENER ? 'listener' : 'broadcaster';
        this.span = Instrumentation.producer(`p2p:${mode}`);

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

                    const propagation: Propagation = {};
            
                    if (Object.hasOwn(item.payload, 'traceparent')) {
                        propagation.traceparent = item.payload.traceparent;
                    }
            
                    if (Object.hasOwn(item.payload, 'tracestate')) {
                        propagation.tracestate = item.payload.tracestate;
                    }

                    if (handler) {
                        const span = Instrumentation.consumer(`p2p:rx:${event}`, propagation);
                        span.attr('handler', handler.name);
                        span.attr('peer', payload.peer);
                        await handler(item, span);
                        Instrumentation.end(span);
                    } else {
                        console.info('P2P', 'Unknown event', event);
                    }
                } catch (e) {
                    console.error(e);
                }
                    
                consumable.id = item.id;
            }

            if (!this.initialized) {
                this.initialized = true;
                await this.init();
                Instrumentation.end(this.span);
            }
        }
    }

    public runningAs(): P2PMode {
        return this.mode;
    }
}   