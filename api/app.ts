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
// import { myEncryptedStingST, decryptedData, verifyMySignature, getTokenPartner, encryptedStringST } from './utils/utils';

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
    // const key = process.env.SECRET_KEY as string;
    // const time = moment().unix();
    // const hmac1 = crypto.createHash('sha256');
    // // const stringInfo = `${key}${'/api/getInfo/463029405607'}${time}`;
    // const stringInfo = `${key}${'/api/getInfo/463029405607'}16711357956`;
    // const hashCreateTokenInfo = hmac1.update(stringInfo).digest('base64');
    // const hmac2 = crypto.createHash('sha256');
    // console.log('String info', stringInfo);
    // console.log('time', time);
    // console.log('token info', hashCreateTokenInfo);
    // const objData = {
    //   sendPayAccount: '34637636346',
    //   sendAccountName: 'Khach Hang 1',
    //   receiverPayAccount: '493747116445',
    //   typeFee: 'receiver',
    //   amountOwed: 500000,
    //   bankReferenceId: 'bank1',
    //   description: '',
    // };

    // const objDataPartner = {
    //   send_STK: '463029405607',
    //   send_Money: 10000,
    //   receive_BankID: '2',
    //   receive_STK: '1000002',
    //   content: 'string',
    //   paymentFeeTypeID: 1,
    //   transactionTypeID: 1,
    //   bankReferenceId: 1,
    //   rsa: 'string'
    // };

    // const stringTransaction = `${key}${'/api/transaction/addmoney'}${objData.sendPayAccount}${objData.sendAccountName}${objData.receiverPayAccount}${objData.typeFee}${objData.amountOwed}${objData.bankReferenceId}${time}`;
    // const hashCreateTokenTransaction = hmac2.update(stringTransaction).digest('base64');
    // const signature = myEncryptedStingST();

    // console.log('signature', signature);
    // console.log('String transaction', stringTransaction);
    // console.log('token transaction', hashCreateTokenTransaction);
    // const chuKy = 'gjQlJVMhxvttdR6z7T98FcJaUfMTUZrbXSfpnsqiuPqpmevSMSG+9tw1m3Vog2d1CCbWWEhzQeQaS+jn1Gwthdt7HhxMAzSgiDSP5UQuFODS7wThy0Wbp0jhvpTGKrt8Dywj6zvRm5L9KKiYdgqiyC8WwXcpb5/UkjAX1TFOOGc=';
    // console.log(verifyMySignature(chuKy));
    // const timeString = time.toString();
    // const tokenPartner = getTokenPartner(time.toString(), 'bank1');
    // const stringSignaturePartner = `${objDataPartner.send_STK}${objDataPartner.send_Money}${objDataPartner.receive_STK}`;
    // const signaturePartner = encryptedStringST(stringSignaturePartner, 'bank1');
    // console.log('timeString', timeString);
    // console.log('tokenPartner', tokenPartner);
    // console.log('signaturePartner', signaturePartner);
    // const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa',
    //   {
    //     modulusLength: 1024
    //   });
    //   console.log(publicKey.export({
    //     type: "spki",
    //     format: "pem",
    //   }));
    //   console.log(privateKey.export({
    //     type: "pkcs8",
    //     format: "pem",
    //   }));
    app.listen(app.get('port'), () => console.log(`Api Nhom12IB listening on port ${app.get('port')}`));
  } catch (err) {
    console.error(err);
  }
};

main();

export { app };
