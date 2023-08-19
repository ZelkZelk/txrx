import { WebSocket } from "ws";

export type ConnectionPool = {
    [key: string]: WebSocket;
};

export type Transmission = {
    data: string;
    tx: string;
    conn: string;
    id?: string;
};

export type TransmissionPool = {
    [key:string] : {
        [key: string]: Transmission;
    };
};

export type Heartbeats = {
    [key: string]: number;
};

export type Rates = {
    [key: string]: {
        counter: 0,
        timestamps: number[],
    }
};
