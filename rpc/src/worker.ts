import { P2PBroadcaster } from 'p2p';
import { Consumable, ConsumeItem } from 'consumer/types/consumer.types';
import { Worker as ConsumeWorker } from "consumer";
import RPC from './rpc';

@P2PBroadcaster(process.env.RPC!)
export default class Worker extends ConsumeWorker{
    private rpc: RPC;

    constructor(url: string) {
        super(url);
        this.rpc = new RPC(url);
    }

    public startPel(): string {
        return Date.now() - parseInt(process.env.TTL!) + '';
    }

    public consumable(): Consumable {
        return {
            group: process.env.CONSUMER_GROUP!,
            consumer: process.env.CONSUMER!,
            block: parseInt(process.env.CONSUMER_BLOCK!),
            count: parseInt(process.env.CONSUMER_COUNT!),
            stream: process.env.RPC!,
            id: this.startPel(),
        };
    }

    public async run(): Promise<void> {
        await this.rpc.init();
        await super.run();
    }

    public async consume(item: ConsumeItem): Promise<boolean> {
        return await this.rpc.handler(item.payload);
    }
}
