import { ConsumeItem } from "consumer/types/consumer.types";
import { P2PHandler } from "../decorators/p2p.decorators";
import Handler from "../handler";
import P2P from "../p2p";
import Shard from "../shard";
import Peers from "../peers";
import { P2PMode } from "../../types/p2p.types";
import Span from "telemetry/src/artifacts/span";
import { Instrumentation } from "telemetry";

export default class Protocol extends Handler {
    public constructor(url: string) {
        super(url);
    }

    @P2PHandler
    public async hello(item: ConsumeItem, parent: Span): Promise<void> {
        if (!Object.hasOwn(item.payload, 'peer')) {
            return;
        }

        const p2p = await P2P.get();

        if (p2p.isMe(item)) {
            return;
        }

        if (p2p.runningAs() === P2PMode.BROADCASTER) {
            await p2p.share(parent);
        }
    }

    @P2PHandler
    public async init(item: ConsumeItem, parent: Span): Promise<void> {
        if (!Object.hasOwn(item.payload, 'peer')) {
            return;
        }

        const p2p = await P2P.get();

        if (p2p.isMe(item)) {
            return;
        }

        if (p2p.runningAs() === P2PMode.BROADCASTER) {
            await p2p.share(parent);
        }
        else {
            await p2p.hello(parent);
        }
    }

    @P2PHandler
    public async share(item: ConsumeItem, parent: Span): Promise<void> {
        if (!Object.hasOwn(item.payload, 'shard')) {
            return;
        }

        if (!Object.hasOwn(item.payload, 'peer')) {
            return;
        }

        const peer = item.payload.peer;
        const p2p = await P2P.get();
        const shard = Shard.unserialize(item.payload.shard);
        const events = Object.keys(shard);
        const current = Object.keys(Peers.get(peer) ?? {});
        const missing = current.filter(event => !events.includes(event));

        if (missing.length > 0) {
            const span = Instrumentation.producer('p2p:shard:del', parent);
            for await (const event of missing) {
                p2p.del(event);
            }
            span.attr('shard', missing);
            Instrumentation.end(span);
        }

        if (events.length > 0) {
            const span = Instrumentation.producer('p2p:shard:add', parent);
            for await (const event of events) {
                p2p.add(event, shard[event]);
            }
            span.attr('shard', events);
            Instrumentation.end(span);
        }

        Peers.set(peer, shard);
    }
}
