import { Computation, Mapping } from "../types/rpc.types";
import Handler from "./handler";
import * as path from 'path';
import { promises as fsp } from 'fs';

export default class Registry {
    private static registry?: Registry;
    private mapping: Mapping = {};
    private handlers: Handler[] = [];

    private constructor() {}

    public static async get(): Promise<Registry> {
        if (!Registry.registry) {
            Registry.registry = new Registry(); 
        }

        return Registry.registry;   
    }

    public async load(): Promise<void> {
        const fixedDirectory =  '../../../' + process.env.HANDLERS_DIR!;
        const handlersDirectory = path.join(__dirname, fixedDirectory);
        const files = await fsp.readdir(handlersDirectory);

        for await (const file of files) {
            if (/\.(j|t)s$/.test(file)) {
                const handlerModule = await import(path.join(__dirname, fixedDirectory, file));
                this.handlers.push(new handlerModule.default());
            }
        }
    }

    public register(command: string, handler: (...data: string[]) => Promise<Computation>) {
        this.mapping[command] = handler;
    }

    public compute(command: string): (...data: string[]) => Promise<Computation> | null {
        return this.mapping[command] ?? this.mapping.noop;
    }
}
