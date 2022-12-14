import { WebSocketServer, WebSocket } from 'ws';

// Interfaces
import { Notify } from 'interfaces/notify.interface';

// Models
import DebtReminder from '../models/debt_reminder';

// Utils
import { IncomingMessage } from 'http';
import { isNull, isNullObj } from '../utils/utils';

const WS_PORT = 36236;
const socketServer = new WebSocketServer({
  port: WS_PORT
});

const model = DebtReminder;

socketServer.on('connection', function (client: any, req: IncomingMessage) {
  const objData = {
    mgs: 'Client connects successfully!',
    isConnect: true
  };
  client.send(JSON.stringify(objData));
  client.on('message', async function message(data: any) {
    const { userId, payNumber } = JSON.parse(data);

    if (!(client.isFisrtMgs)) {
      client.isFisrtMgs = true;
      if (userId) client.userId = userId;
      if (payNumber) client.payNumber = payNumber as string;
    }
  });
});
console.log(`WebSocket Server is running at ws://localhost:${WS_PORT}`);

export function broadcastObjAll(obj: Notify) {
  const objString = JSON.stringify(obj);
  socketServer.clients.forEach((client: any) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(objString);
    }
  });
}

export function sendObjInList(obj: Notify, userIds: string[]) {
  const objString = JSON.stringify(obj);
  for (const userId of userIds) {
    socketServer.clients.forEach((client: any) => {
      const userIdClient = client.userId.toString('utf8');
      if (client.readyState === WebSocket.OPEN && userId === userIdClient) {
        client.send(objString);
      }
    });
  }
}

export function sendObjInListByPayNumber(obj: Notify, payNumbers: string[]) {
  const objString = JSON.stringify(obj);
  for (const payNumber of payNumbers) {
    socketServer.clients.forEach((client: any) => {
      const userPayNumber = client.payNumber.toString('utf8');
      if (client.readyState === WebSocket.OPEN && payNumber === userPayNumber) {
        client.send(objString);
      }
    });
  }
}

export default socketServer;