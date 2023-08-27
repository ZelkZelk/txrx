import WebSocket from 'isomorphic-ws';
import { Subject, Subscription } from 'rxjs';
import { WebSocketEvent, WebSocketEventType, WebSocketUpdate } from '../../types/websocket.types';

export default class Client {
    private subject: Subject<WebSocketUpdate>;
    private ws: WebSocket;
    private url: string;

    public constructor(url: string) {
        this.subject = new Subject<WebSocketUpdate>();
        this.url = url;
    }

    public subscribe(fn: (update: WebSocketUpdate) => void): Subscription {
        return this.subject.subscribe(fn);
    }

    public connect(): WebSocket {
        this.ws = new WebSocket(this.url);
        this.ws.onopen = this.update.bind(this, WebSocketEventType.OPEN);
        this.ws.onclose = this.update.bind(this, WebSocketEventType.CLOSE);
        this.ws.onerror = this.update.bind(this, WebSocketEventType.ERROR);
        this.ws.onmessage = this.update.bind(this, WebSocketEventType.MESSAGE);

        return this.ws;
    }

    public close() {
        this.ws.close();
    }

    public send(message: string) {
        this.ws.send(message);
    }

    protected update(type: WebSocketEventType, event: WebSocketEvent) {
        this.subject.next([type, event]);
    }
}