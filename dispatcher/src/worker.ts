import { Consumable, ConsumeItem } from 'consumer/types/consumer.types';
import Dispatcher from './dispatcher';
import { P2PMapping } from "p2p/types/p2p.types";
import { subscribe as P2Psubscribe, P2PListener } from 'p2p';
import { Worker as ConsumerWorker } from 'consumer';
import { Subscription } from 'rxjs';

@P2PListener()
export default class Worker extends ConsumerWorker {
    private dispatcher: Dispatcher;
    private p2psub: Subscription;

    constructor(url: string) {
        super(url);
        this.dispatcher = new Dispatcher(url);
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
            stream: process.env.TX!,
            id: this.startPel(),
        };
    }

    public async run(): Promise<void> {
        this.p2psub = await P2Psubscribe(async (_:P2PMapping): Promise<void> => {
            this.consumePel();
        });

        await super.run();

        if (this.p2psub) {
            this.p2psub.unsubscribe();
        }
    }

    public async consume(item: ConsumeItem): Promise<boolean> {
        return this.dispatcher.handler(item.payload);
    }
}
