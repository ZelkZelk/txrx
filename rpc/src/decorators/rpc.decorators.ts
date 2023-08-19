import { P2PShare } from "p2p";
import { Computation } from "../../types/rpc.types";
import Registry from "../registry";

function RPC(target: (...args: string[]) => Promise<Computation> , context: ClassMethodDecoratorContext) {    
    P2PShare(target, context);
    
    context.addInitializer(async function () {
        const snake = (context.name as string).replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        (await Registry.get()).register(snake, target.bind(this));
    });
}

export {
    RPC
};
