import {} from 'telemetry';
import { WebSocketServer } from 'ws';
import Queue from './queue';
import Transceiver from './transceiver';

const port = parseInt(process.env.WEBSOCKET_PORT ?? '8080');
const redis = process.env.REDIS_BUS ?? 'redis://localhost:6379';

const wss = new WebSocketServer({ port });
const queue = new Queue();
queue.heartbeat();

const transceiver = new Transceiver(queue, redis);

wss.on('connection', function connection(ws) {
  const conn = queue.add(ws);

  console.info(conn, '+');

  ws.on('error', console.error);

  ws.on('close', () => {
    ws.send('bye');
    queue.remove(conn);
    console.info(conn, '-');
  });

  ws.on('message', function message(msg) {
    let data;

    if (msg instanceof Buffer) {
      data = msg.toString();
    }
    else if(typeof msg === 'string') {
      data = msg;
    }

    if(typeof data === 'string') {
      (async () => {
        if (data.match(/^pong\s\d+/)) {
          return queue.pong(conn, data);
        }
        
        if (queue.throttle(conn)) {
          return queue.throttling(conn);
        }

        const tx = queue.prepareTx(conn, data);
        console.info(conn, 'tx', tx.tx, data);

        const id = await transceiver.transmit(tx);
        queue.settleTx(conn, tx.tx, id);
      })();
    }
  });

  (async () => {
    await transceiver.run();
  })();
});
