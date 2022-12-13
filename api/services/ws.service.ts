import { IncomingMessage } from 'http';
import { Notify } from 'interfaces/notify.interface';
import { WebSocketServer, WebSocket } from 'ws';

const WS_PORT = 36236;
const socketServer = new WebSocketServer({
  port: WS_PORT
});

socketServer.on('connection', function (client: any, req: IncomingMessage) {
  client.send('Client connects successfully!');
  client.on('message', function message(data: any) {
    if (!(client.isFisrtMgs)) {
      client.isFisrtMgs = true;
      const { userId, payNumber } = JSON.parse(data);
      if (userId) client.userId = userId;
      if (payNumber) client.payNumber = payNumber as string;
    }
  });
})
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

export default socketServer;