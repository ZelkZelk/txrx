export type Consumable = {
    group?: string;
    consumer?: string;
    count: number;
    block: number;
    stream: string;
    id: string;
};

export type Disposable = {
    group: string;
    consumer: string;
    idle: number;
    min: string;
    max: string;
    stream: string;
    count: number;
};

export type PendingItem = [string, string, number, number];

export type Consumption = [
    string,
    Consumption[] | string[]
];

export type Payload = {
    [key:string]: string;
};

export type ConsumeItem = {
    stream: string,
    id: string,
    payload: Payload,
};
