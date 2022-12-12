import { IncomingMessage } from 'http';
import { WebSocketServer, WebSocket } from 'ws';

const WS_PORT = 36236;
const socketServer = new WebSocketServer({
  port: WS_PORT
});

socketServer.on('connection', function (client: any, req: IncomingMessage) {
  console.log('Client connects successfully!');
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

export function broadcastAll(message: string) {
  socketServer.clients.forEach((client: any) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

export function sendMgsInList(message: string, userIds: string[]) {
  for (const userId of userIds) {
    socketServer.clients.forEach((client: any) => {
      const userIdClient = client.userId.toString('utf8');
      if (client.readyState === WebSocket.OPEN && userId === userIdClient) {
        client.send(message);
      }
    });
  }
}

export function sendObjInList(obj: Object, userIds: string[]) {
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