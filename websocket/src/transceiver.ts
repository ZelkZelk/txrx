import { Worker as ConsumerWorker } from 'consumer';
import { Streamer } from "streamer";
import { Transmission } from "../types/websocket.types";
import { Consumable, ConsumeItem } from 'consumer/types/consumer.types';
import Queue from './queue';

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
        const client = this.queue.prepareRx(item);
  
        if (client) {
            if (Object.hasOwn(item.payload, 'data')) {
                console.info(item.payload.conn, 'rx', item.payload.tx, item.payload.data);
                client.send(item.payload.data);
            }
        }

        return true;
    }
    
}