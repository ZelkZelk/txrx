import { Instrumentation, Spanner } from 'telemetry';
import { WebSocketServer } from 'ws';
import Queue from './queue';
import Transceiver from './transceiver';

const mainSpan = Instrumentation.service();
const port = parseInt(process.env.WEBSOCKET_PORT ?? '8080');
const redis = process.env.REDIS_BUS ?? 'redis://localhost:6379';

const wss = new WebSocketServer({ port });
const queue = new Queue();
const transceiver = new Transceiver(queue, redis);

setImmediate(() => {
  queue.heartbeat();
  
  (async () => {
    await transceiver.run();
  })();
});

setImmediate(() => {
  wss.on('connection', function connection(ws) {
    const connSpan = Instrumentation.producer('connection', mainSpan);
    const conn = queue.add(ws);
    connSpan.attr('conn', conn);

    console.info(conn, '+');

    ws.on('error', (err) => {
      const errorSpan = Instrumentation.consumer('error', connSpan);
      console.error(err);
      Instrumentation.end(errorSpan);
    });

    ws.on('close', () => {
      const closeSpan = Instrumentation.consumer('close', connSpan);
      ws.send('bye');
      queue.remove(conn);
      console.info(conn, '-');
      Instrumentation.end(closeSpan);
    });

    ws.on('message', function message(msg) {
      const messageSpan = Instrumentation.consumer('message', connSpan);
      let data;

      if (msg instanceof Buffer) {
        data = msg.toString();
      }
      else if(typeof msg === 'string') {
        data = msg;
      }

      if(typeof data === 'string') {
        (async () => {
          let span;

          if (data.match(/^pong\s\d+/)) {
            span = Instrumentation.producer('pong', messageSpan);
            queue.pong(conn, data);
          }
          else if (queue.throttle(conn)) {
            span = Instrumentation.producer('throttle', messageSpan);
            queue.throttling(conn);
          }
          else {
            const [command] = data.split(/\s/);
            span = Instrumentation.producer(command, messageSpan);
            const tx = queue.prepareTx(conn, data);
            console.info(conn, 'tx', tx.tx, data);
  
            const id = await transceiver.transmit(tx);
            queue.settleTx(conn, tx.tx, id);
          }

          Instrumentation.end(span);
        })();
      }

      Instrumentation.end(messageSpan);
    });

    Instrumentation.end(connSpan);
  });
});
  
Instrumentation.end(mainSpan);
