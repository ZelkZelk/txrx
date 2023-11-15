import { Instrumentation } from 'telemetry';
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
  wss.on('connection', function connection(ws, req) {
    const connSpan = Instrumentation.producer('ws:connection', false);
    const conn = queue.add(ws);
    connSpan.attr('ws', mainSpan.get().spanContext().spanId);
    connSpan.attr('conn', conn);

    for(const header of Object.keys(req.headers)) {
      const maybeHeaders = req.headers[header];

      if (typeof maybeHeaders === 'string') {
        connSpan.attr(`header:${header}`, maybeHeaders);
      } else {
        connSpan.attr(`header:${header}`, maybeHeaders.join(' '));
      }
    }

    ws.on('error', (err) => {
      const errorSpan = Instrumentation.consumer('ws:error', connSpan);
      errorSpan.attr('err', err.message);
      console.error(err);
      Instrumentation.end(errorSpan);
    });

    ws.on('close', () => {
      const closeSpan = Instrumentation.consumer('ws:close', connSpan);
      ws.send('bye');
      queue.remove(conn);
      Instrumentation.end(closeSpan);
    });

    ws.on('message', function message(msg) {
      const messageSpan = Instrumentation.consumer('ws:message', connSpan);
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
            span = Instrumentation.producer('ws:pong', messageSpan);
            queue.pong(conn, data);
          }
          else if (queue.throttle(conn)) {
            span = Instrumentation.producer('ws:throttle', messageSpan);
            const countdown = queue.throttling(conn);
            span.attr('cd', countdown);
          }
          else {
            const [command] = data.split(/\s/);
            span = Instrumentation.producer(`ws:msg:${command}`, messageSpan);

            const propagation = Instrumentation.propagate(span);
            const tx = queue.prepareTx(conn, data, propagation);
            span.attr('tx', tx.tx);
  
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
