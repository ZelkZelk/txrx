import { Worker as ConsumerWorker } from 'consumer';
import { Streamer } from "streamer";
import { Transmission } from "../types/websocket.types";
import { Consumable, ConsumeItem } from 'consumer/types/consumer.types';
import Queue from './queue';
import { Propagation } from 'telemetry/types/telemetry.types';
import { Instrumentation } from 'telemetry';

export default class Transceiver extends ConsumerWorker {
    private streamer: Streamer;
    private queue: Queue;

    constructor(queue: Queue, url: string) {
        super(url);
        this.streamer = new Streamer(url);
        this.queue = queue;
    }

    public startPel(): string {
        return Date.now() - parseInt(process.env.TTL!) + '';
    }

    public async transmit(tx: Transmission): Promise<string> {
        return this.streamer.stream({
            stream: process.env.TX!,
            id: '*',
            payload: tx,
            maxlen: parseInt(process.env.STREAM_MAXLEN!),
        });
    }
    
    public consumable(): Consumable {
        return {
            group: process.env.CONSUMER_GROUP!,
            consumer: process.env.CONSUMER!,
            block: parseInt(process.env.CONSUMER_BLOCK!),
            count: parseInt(process.env.CONSUMER_COUNT!),
            stream: process.env.RX!,
            id: this.startPel(),
        };
    }

    public async consume(item: ConsumeItem): Promise<boolean> {
        const propagation: Propagation = {};

        if (Object.hasOwn(item.payload, 'traceparent')) {
            propagation.traceparent = item.payload.traceparent;
        }

        if (Object.hasOwn(item.payload, 'tracestate')) {
            propagation.tracestate = item.payload.tracestate;
        }

        if (Object.hasOwn(item.payload, 'data')) {              
            const client = this.queue.prepareRx(item);
    
            if (client) {
                const [command] = item.payload.data.split(/\s|\n/);
                const span = Instrumentation.producer(`ws:rx:${command}`, propagation);
                client.send(item.payload.data);
                Instrumentation.end(span);
            }
        }


        return true;
    }
    
}