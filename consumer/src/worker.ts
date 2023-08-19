import { Consumable, ConsumeItem } from "../types/consumer.types";
import Consumer from "./consumer";
import { setTimeout } from 'timers/promises';

export default abstract class Worker {
    public abstract startPel(): string;
    public abstract consumable(): Consumable;
    public abstract consume(item: ConsumeItem): Promise<boolean>;

    private consumer: Consumer;
    private running = true;
    private pel = true;
    private consuming: Consumable;
    private last: string | null = null;
    private nextPel = false;

    constructor(url: string) {
        this.consumer = new Consumer(url);
    }

    public isRunning(): boolean {
        return this.running;
    }

    public setRunning(running: boolean) {
        this.running = running;
    }

    public consumePel() {
        this.nextPel = true;
    } 

    public async run(): Promise<void> {
        this.consuming = this.consumable();

        try {
            await this.consumer.createGroup(this.consuming);
        } catch (e) {
            if (/BUSYGROUP/.test(e)) {
                console.info(e);
            }
        }

        while (this.running) {
            const items: ConsumeItem[] = await this.consumer.consume(this.consuming);

            if (items.length === 0 && this.consuming.id !== '>') {
                this.pel = false;
            }

            for await(const item of items) {
                try {
                    const ack = await this.consume(item);

                    if (ack) {
                        await this.consumer.ack(this.consuming, item);
                    }
                } catch (e) {
                    console.error(e);
                }
                    
                this.consuming.id =  item.id;
            }

            if (this.pel === false) {
                this.consuming.id = '>';
            } else {
                await setTimeout(this.consuming.block);

                if (this.last === null) {
                    this.last = this.consuming.id;
                    this.consuming.id = '>';
                } else {
                    this.consuming.id = this.last;
                    this.last = null;
                }
            }

            if (this.nextPel) {
                this.nextPel = false;
                this.pel = true;
                this.consuming.id = this.startPel();
            }
        }
    }
}