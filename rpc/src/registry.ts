import { Computation, Mapping } from "../types/rpc.types";
import Handler from "./handler";

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
        const backend = await import('backend');

        for await (const module of Object.keys(backend)) {
            this.handlers.push(new backend[module]());
        }
    }

    public register(command: string, handler: (...data: string[]) => Promise<Computation>) {
        this.mapping[command] = handler;
    }

    public compute(command: string): (...data: string[]) => Promise<Computation> | null {
        return this.mapping[command] ?? this.mapping.noop;
    }
}
