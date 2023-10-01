import { ConsumeItem } from 'consumer/types/consumer.types';
import { ConnectionPool, Transmission, TransmissionPool, Heartbeats, Rates } from './../types/websocket.types';
import { WebSocket } from "ws";
import { v4 as uuidv4 } from 'uuid';

export default class Queue {
    private connectionPool: ConnectionPool = {};
    private txPool: TransmissionPool = {};
    private heartbeatInterval: NodeJS.Timer;
    private heartbeats: Heartbeats = {};
    private rates: Rates = {};

    public throttle(conn: string): boolean {
        const now = Date.now();
        const limit = parseInt(process.env.THROTTLE_MESSAGES!);
        const unit = parseInt(process.env.THROTTLE_TIME_UNIT!);
        const boundary = now - unit;

        if (! this.rates[conn]) {
            this.rates[conn] = {
                counter: 0,
                timestamps: [],
            };
        }

        this.rates[conn].timestamps.push(now);

        this.rates[conn].timestamps = this.rates[conn].timestamps.filter(t => {
            return t >= boundary;
        }).slice(0, limit + 1);

        if (this.rates[conn].timestamps.length > limit) {
            return true;
        }

        this.rates[conn].counter--;

        if (this.rates[conn].counter < 0) {
            this.rates[conn].counter = 0;
        }

        return false;
    }

    public throttling(conn: string): void {
        const ws = this.connectionPool[conn];
        if (ws) {
            const warns = parseInt(process.env.THROTTLE_WARNS!);

            let countdown = warns - this.rates[conn].counter;
            this.rates[conn].counter++;

            if (countdown <= 0) {
                ws.close();
                return;
            }

            const unit = parseInt(process.env.THROTTLE_TIME_UNIT!);
            const ends = Date.now() + unit;
            ws.send(`throttle ${ends} ${countdown}`);
        }
    }

    public heartbeat(): void {
        if (! this.heartbeatInterval) {
            this.heartbeatInterval = setInterval(() => {
                const now = Date.now();

                for(const conn of Object.keys(this.heartbeats)) {
                    this.close(conn);
                }

                this.heartbeats = Object.assign({}, Object.fromEntries(Object.keys(this.connectionPool).map(conn => [conn, now])));
                for(const conn of Object.keys(this.heartbeats)) {
                    this.ping(conn, now);
                }

            }, parseInt(process.env.TTL!) / 2);
        }
    }

    public ping(conn: string, now: number): void {
        const ws = this.connectionPool[conn];
        if (ws) {
            ws.send(`ping ${now}`);
        }
    }

    public pong(conn: string, pong: string): void {
        const ping = parseInt(pong.replace(/^pong\s/, ''));

        if (ping === this.heartbeats[conn]) {
            delete this.heartbeats[conn];
        }
    }

    public close(conn: string): void {
        const ws = this.connectionPool[conn];

        if (ws) {
            ws.close();
        }
    }

    public add (ws: WebSocket): string {
        const conn = uuidv4();

        this.connectionPool[conn] = ws;

        return conn;
    }

    public all(): WebSocket[] {
        return Object.values(this.connectionPool);
    }

    public remove (conn: string): WebSocket | undefined {
        const ws = this.connectionPool[conn];

        delete this.connectionPool[conn];

        delete this.txPool[conn];

        delete this.heartbeats[conn];

        delete this.rates[conn];

        return ws;
    }


    public prepareTx (conn: string, data: string): Transmission {
        if (typeof this.txPool[conn] === 'undefined') {
            this.txPool[conn] = {};
        }

        const tx = uuidv4();
        const transmission = {
            conn,
            data,
            tx,
        };

        this.txPool[conn][tx] = transmission;

        return transmission;
    }

    public settleTx (conn: string, tx: string, id: string) {
        if (typeof this.txPool[conn] !== 'undefined') {
            if (typeof this.txPool[conn][tx] !== 'undefined') {
                this.txPool[conn][tx].id = id;
            }
        }
    }

    public prepareRx(item: ConsumeItem): WebSocket | undefined | null {
        const conn = item.payload.conn ?? '';
        const tx = item.payload.tx ?? '';

        if (typeof this.connectionPool[conn] === 'undefined') {
            return null;
        }

        if (typeof this.txPool[conn] === 'undefined') {
            return null;
        }

        if (typeof this.txPool[conn][tx] === 'undefined') {
            return null;
        }

        return this.connectionPool[conn];
    }
}