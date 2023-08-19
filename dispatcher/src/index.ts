import Worker from "./worker";

const redis = process.env.REDIS_BUS ?? 'redis://localhost:6379';

const worker = new Worker(redis);

(async() => {
    await worker.run();
})();
