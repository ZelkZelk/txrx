import { Computation } from './../types/rpc.types';

export default abstract class Handler {
    public rx(ack: boolean, ...messages: string[]): Computation {
        return {
            ack,
            messages: messages.map(data => {
                return {
                    stream: process.env.RX!,
                    id: '*',
                    payload: {
                        data
                    },
                    maxlen: parseInt(process.env.STREAM_MAXLEN!),
                }
            })
        }
    }
}
