import * as dotenv from 'dotenv';
dotenv.config();

import { Request, Response } from 'express';

// Services
import { } from './services/cache.service';
import ws from './services/ws.service.js';
import logger from './services/logger.service';

// Modules
import * as express from 'express';
import * as morgan from 'morgan';
import * as cors from 'cors';

import setMongo from './databases/mogodb';
import setRoutes from './routes';

// import * as crypto from 'crypto';
// import * as moment from 'moment';
// import { myEncryptedData } from './utils/utils';

// const whitelist = process.env.WHITELIST?.split(',');
// const corsOptions = {
//   origin: function (origin: any, callback: any) {
//     if (whitelist?.indexOf(origin) !== -1) {
//       callback(null, true)
//     } else {
//       callback(new Error('Not allowed by CORS'))
//     }
//   }
// }

// For Test Dev
const corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200
}

const app = express();
app.use(cors(corsOptions));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});
const myStream = {
  write: (text: string) => {
    logger.info(text);
  }
};
morgan.token('headers', (req: Request, res: Response) => `\tHEADERS JSON: ${JSON.stringify(req.headers)}`);
morgan.token('body', (req: Request, res: Response) => `\tBODY JSON: ${JSON.stringify(req.body)}`);
morgan.token('params', (req: Request, res: Response) => `\t PARAMS JSON: ${JSON.stringify(req.params)}`);
morgan.token('query', (req: Request, res: Response) => `\t QUERYS JSON: ${JSON.stringify(req.query)}`);
app.use(morgan('[:date[clf]] :method :url HTTP/:http-version :status :res[content-length] :referrer :user-agent :headers :body :params :query \n', { stream: myStream }));
app.set('port', 3000);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const main = async (): Promise<any> => {
  try {
    await setMongo();
    setRoutes(app);
    ws; // Run websocket
    // const time = moment().unix();
    // const hmac1 = crypto.createHmac('sha256', 'nhom12ibFTP');
    // const hmac2 = crypto.createHmac('sha256', 'nhom12ibFTP');
    // const objToken = {
    //   time,
    //   bankId: 'bank1'
    // };
    
    // const objData = {
    //   sendPayAccount: '34637636346',
    //   sendAccountName: 'Khach Hang 1',
    //   receiverPayAccount: '493747116445',
    //   payAccountFee: '493747116445',
    //   transactionFee: 5000,
    //   amountOwed: 500000,
    //   description: '',
    // };
    // const hashCreateTokenInfo = hmac1.update(`nhom12ibFTP${'/api/getInfo/463029405607'}${time}`).digest('hex');
    // const hashCreateTokenTransaction = hmac2.update(`nhom12ibFTP-${'/api/transaction/addmoney'}-${objData.sendAccountName}-${objData.sendPayAccount}-${objData.receiverPayAccount}-${objData.amountOwed}-${objData.payAccountFee}-${objData.transactionFee}-${time}`).digest('hex');
    // const newToken = myEncryptedData(objToken);
    // console.log('newToken', newToken);
    // console.log('token info', hashCreateTokenInfo);
    // console.log('token transaction', hashCreateTokenTransaction);
    app.listen(app.get('port'), () => console.log(`Api Nhom12IB listening on port ${app.get('port')}`));
  } catch (err) {
    console.error(err);
  }
};

main();

export { app };
