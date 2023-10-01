import { Handler, RPC } from "rpc";
import { Computation } from "rpc/types/rpc.types";
import { Allow } from "../../decorators/auth.decorators";
import { setTimeout } from "timers/promises";

export default class General extends Handler {
    @RPC
    public async ping(data: string): Promise<Computation> {
        const bounce = data.replace(/^ping\s/, '');
        return this.rx(true, 'pong ' + bounce);
    }

    @RPC
    public async time(_: string): Promise<Computation> {
        return this.rx(true, 'time ' + Date.now());
    }

    @RPC
    public async noop(_: string): Promise<Computation> {
        return this.rx(true, 'noop');
    }
    
    @RPC
    @Allow('ADMIN')
    public async sleep(_authorized: string, data: string): Promise<Computation> {
        const [_, sleep] = data.split(' ');

        const ms = parseInt(sleep);

        if (! isNaN(ms)) {
            if (ms > 0 && ms <= 10000) {
                await setTimeout(ms);

                return this.rx(true, data.replace(/^sleep\s/, 'slept '));
            }
        }

        return this.rx(true, 'awoken');
    }
}