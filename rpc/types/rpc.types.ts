import { Payload } from "consumer/types/consumer.types";
import { Streamable } from "streamer/types/streamer.types";

export type Mapping = {
    [key: string]: (...data: string[]) => Promise<Computation>
};

export type Computation = {
    ack: boolean;
    messages: Streamable[];
};
