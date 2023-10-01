import { Payload } from 'consumer/types/consumer.types';
import { Streamer } from "streamer";
import Registry from "./registry";
import { setTimeout } from 'timers/promises'

export default class RPC {
    private streamer: Streamer;

    public constructor(url: string) {
        this.streamer = new Streamer(url);
    }

    public async init(): Promise<void> {
        const registry = await Registry.get();
        await registry.load();
    }

    private getCommand(data: string): string {
        const [command] = data.split(/\s/);

        return command;
    }

    public async handler(payload: Payload): Promise<boolean> {
        if (!Object.hasOwn(payload, 'conn')) {
            return true;
        }

        if (!Object.hasOwn(payload, 'tx')) {
            return true;
        }

        if (!Object.hasOwn(payload, 'data')) {
            return true;
        }

        const command = this.getCommand(payload.data);
        const handler = (await Registry.get()).compute(command);

        if (!handler) {
            await setTimeout(100);
            return this.handler(payload);
        }

        const computation = await handler(...[payload.data, payload.conn, payload.tx]);

        await Promise.all(computation.messages.map(async (message) => {
            message.payload = {
                conn: payload.conn,
                tx: payload.tx,
                ...message.payload,
            };

            return this.streamer.stream(message);
        }));

        return computation.ack;
    }
}
