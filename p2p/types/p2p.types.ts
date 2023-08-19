import { ConsumeItem } from "consumer/types/consumer.types";

export type P2PMapping = {
    [key:string]: string;
};

export type PeerShards = {
    [key:string]: P2PMapping;
};

export type P2PHandlers = {
    [key:string]: (item: ConsumeItem) => Promise<void>;
};

export enum P2PMode {
    BROADCASTER,
    LISTENER,
};
