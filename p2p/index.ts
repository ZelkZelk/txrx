import { Subscription } from 'rxjs';
import { P2PBroadcaster, P2PListener, P2PShare } from './src/decorators/p2p.decorators';
import P2P from './src/p2p';
import { P2PMapping } from './types/p2p.types';

const subscribe = async (fn: (mapping: P2PMapping) => Promise<void>): Promise<Subscription> => {
    const p2p = await P2P.get();

    return p2p.subscribe(fn);
};

const resolve = async(event: string): Promise<string | null> => {
    const p2p = await P2P.get();

    return p2p.resolve(event);
};

const hello = async(): Promise<string> => {
    const p2p = await P2P.get();

    return p2p.hello();
};

export {
    P2PListener,
    P2PShare,
    P2PBroadcaster,
    subscribe,
    resolve,
    hello,
};
