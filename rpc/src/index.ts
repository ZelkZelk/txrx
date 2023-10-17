import { Instrumentation } from 'telemetry';

import Worker from "./worker";

const mainSpan = Instrumentation.service();

const redis = process.env.REDIS_BUS ?? 'redis://localhost:6379';

const worker = new Worker(redis);

setImmediate(() => {
    (async() => {
        await worker.run();
    })();
});

Instrumentation.end(mainSpan);
