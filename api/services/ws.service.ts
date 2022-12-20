import { WebSocketServer, WebSocket } from 'ws';

// Interfaces
import { Notify } from 'interfaces/notify.interface';

// Models
import DebtReminder from '../models/debt_reminder';

// Utils
import { IncomingMessage } from 'http';
import { isNull } from '../utils/utils';

const WS_PORT = 36236;
const socketServer = new WebSocketServer({
  port: WS_PORT
});

const model = DebtReminder;

socketServer.on('connection', function (client: any, req: IncomingMessage) {
  client.send('Client connects successfully!');
  client.on('message', async function message(data: any) {
    const { userId, payNumber } = JSON.parse(data);

    if (!(client.isFisrtMgs)) {
      client.isFisrtMgs = true;
      if (userId) client.userId = userId;
      if (payNumber) client.payNumber = payNumber as string;
    }

    const debtReminders = await model.find({ $or: [{ receiverPayAccount: payNumber }, { userId: userId }], _status: true }, { _id: 0, __v: 0, _status: 0 });

    if (!isNull(debtReminders)) {
      if (client.readyState === WebSocket.OPEN) {
        const objData = {
          mgs: 'You receive a debt reminder on the system!',
          data: debtReminders
        };
        client.send(JSON.stringify(objData));
      }
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