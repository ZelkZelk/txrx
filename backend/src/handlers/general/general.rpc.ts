import { Handler, RPC } from "rpc";
import { Computation } from "rpc/types/rpc.types";

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
}