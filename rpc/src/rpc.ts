import { Payload } from 'consumer/types/consumer.types';
import { Streamer } from "streamer";
import Registry from "./registry";
import Span from 'telemetry/src/artifacts/span';
import { Instrumentation } from 'telemetry';

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

        const span = Instrumentation.consumer(`rpc:msg:${command}`, parent);
        const handler = (await Registry.get()).compute(command);
        let ack = false;

        if (handler) {
            span.attr('handler', handler.name);

            const computation = await handler(...[payload.data, payload.conn, payload.tx]);
            const propagation = Instrumentation.propagate(span);
    
            await Promise.all(computation.messages.map(async (message) => {
                message.payload = {
                    conn: payload.conn,
                    tx: payload.tx,
                    ...message.payload,
                    ...propagation,
                };
    
                return this.streamer.stream(message);
            }));

            ack = computation.ack;
        }

        Instrumentation.end(span);

        return ack;
    }
}
