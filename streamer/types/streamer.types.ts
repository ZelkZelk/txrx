export type StreamProfile = {
    stream: string;
    id: string;
};

export type Payload = {
    [key:string]: string;
}

export type Streamable = StreamProfile & {
    payload: Payload
    maxlen: number;
};

export enum Streams {
    TX = 'TX',
    RX = 'RX',
};
