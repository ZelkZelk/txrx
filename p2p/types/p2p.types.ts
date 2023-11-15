import { ConsumeItem } from "consumer/types/consumer.types";
import Span from "telemetry/src/artifacts/span";

export type P2PMapping = {
    [key:string]: string;
};

export type PeerShards = {
    [key:string]: P2PMapping;
};

export type P2PHandlers = {
    [key:string]: (item: ConsumeItem, parent: Span) => Promise<void>;
};

export enum P2PMode {
    BROADCASTER,
    LISTENER,
};
