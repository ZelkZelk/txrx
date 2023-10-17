import { Payload } from "consumer/types/consumer.types";
import { resolve as P2Presolve } from "p2p";
import { Streamer } from "streamer";
import { Instrumentation } from "telemetry";
import Span from "telemetry/src/artifacts/span";

export default class Dispatcher {
    private streamer: Streamer;

    public constructor(url: string) {
        this.streamer = new Streamer(url);
    }

    private getCommand(data: string): string {
        const frames = data.split(/\s/);
        return frames[0].trim();
    }

    public async handler(payload: Payload, parent?: Span): Promise<boolean> {
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

        const span = Instrumentation.consumer(`disp:msg:${command}`, parent);

        const stream = await P2Presolve(command);

        if (stream) {
            await this.streamer.stream({
                id: '*',
                stream,
                payload,
                maxlen: parseInt(process.env.STREAM_MAXLEN!),
            });
        }

        span.attr('stream', stream);

        Instrumentation.end(span);

        return stream ? true : false;
    }
}