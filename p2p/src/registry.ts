import { ConsumeItem } from "consumer/types/consumer.types";
import { P2PHandlers } from "../types/p2p.types";
import * as path from 'path';
import { promises as fsp } from 'fs';
import Handler from "./handler";

export default class Registry {
    private static registry: Registry;
    private mapping: P2PHandlers = {};
    private handlers: Handler[] = [];
    private url: string;

    private constructor(url: string){ 
        this.url = url;
    }

    public static async get(): Promise<Registry> {
        if (!Registry.registry) {
            Registry.registry = new Registry(process.env.REDIS_P2P!);
            await Registry.registry.load();
        }

        return Registry.registry;
    }

    private async load(): Promise<void> {
        const handlersDirectory = path.join(__dirname, 'handlers');

        const files = await fsp.readdir(handlersDirectory);

        for await (const file of files) {
            if (/\.(j|t)s$/.test(file)) {
                const handlerModule = await import(path.join(__dirname, 'handlers', file));
                this.handlers.push(new handlerModule.default(this.url));
            }
        }
    }

    public add(event: string, handler: (item: ConsumeItem) => Promise<void>): void {
        this.mapping[event] = handler;
    }

    public compute(event: string): (item: ConsumeItem) => Promise<void> | null {
        return this.mapping[event];
    }
}