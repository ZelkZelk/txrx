export type PlaygroundMessage = [PlaygroundMessageType, string];

export enum PlaygroundMessageType {
    OPEN,
    CLOSE,
    PING,
    PONG,
    TX,
    RX,
    ERROR,
};

export type IPlaygroundMessage = {
    message: string;
    type: PlaygroundMessageType;
    key?: string;
};
