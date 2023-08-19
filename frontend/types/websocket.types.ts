import WebSocket from 'isomorphic-ws';

export type WebSocketEvent =
    WebSocket.Event |
    WebSocket.ErrorEvent |
    WebSocket.CloseEvent |
    WebSocket.MessageEvent; 

export enum WebSocketEventType {
    OPEN,
    CLOSE,
    ERROR,
    MESSAGE,
};

export type WebSocketUpdate = [WebSocketEventType, WebSocketEvent];

export type IWebSocketApp = {
    url: string;
    tx: Transmission;
    onClose: (event: WebSocket.CloseEvent) => void;
    onOpen: (event: WebSocket.Event) => void;
    onMessage: (event: WebSocket.MessageEvent) => void;
    onError: (event: WebSocket.ErrorEvent) => void;
};

export type Transmission = {
    message: string;
    timestamp: number;
};