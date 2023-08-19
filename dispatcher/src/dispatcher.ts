import { Payload } from "consumer/types/consumer.types";
import { resolve as P2Presolve } from "p2p";
import { Streamer } from "streamer";

export default class Dispatcher {
    private streamer: Streamer;

    public constructor(url: string) {
        this.streamer = new Streamer(url);
    }

    private getCommand(data: string): string {
        const frames = data.split(/\s/);
        return frames[0].trim();
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

        const stream = await P2Presolve(command);

        if (!stream) {
            return false;
        }

        await this.streamer.stream({
            id: '*',
            stream,
            payload,
            maxlen: parseInt(process.env.STREAM_MAXLEN!),
        });

        return true;
    }
}