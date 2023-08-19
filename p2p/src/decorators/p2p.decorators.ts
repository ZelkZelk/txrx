import Registry from "../registry";
import P2P from "../p2p";
import { ConsumeItem } from "consumer/types/consumer.types";
import Shard from "../shard";

let exec: NodeJS.Immediate;
let stream: string;

function P2PListener() {
    return function(_constructor: Function, _context: ClassDecoratorContext) {
        if (!exec) {
            exec = setImmediate(async () => {
                const p2p = await P2P.get();
        
                await p2p.listener();
            });
        }
    }
}

function P2PBroadcaster(consuming: string) {
    stream = consuming;

    return function(_constructor: Function, _context: ClassDecoratorContext) {
        if (!exec) {
            exec = setImmediate(async () => {
                const p2p = await P2P.get();
        
                await p2p.broadcaster();
            });
        }
    }
}

function P2PShare(_: (...args: any[]) => Promise<any>, context: ClassMethodDecoratorContext) {
    if (stream) {
        setImmediate(async () => {
            const snake = (context.name as string).replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

            const p2p = await P2P.get();
            p2p.add(snake, stream);
    
            const shard = await Shard.get();
            shard.add(snake, stream);
        });
    }
}

function P2PHandler(target: (...args: ConsumeItem[]) => Promise<void> , context: ClassMethodDecoratorContext) {
    context.addInitializer(async function () {
        (await Registry.get()).add(context.name as string, target.bind(this));
    });
}

export {
    P2PBroadcaster,
    P2PListener,
    P2PHandler,
    P2PShare,
};
