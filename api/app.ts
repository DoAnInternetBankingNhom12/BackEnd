import * as dotenv from 'dotenv';
dotenv.config();

// Services
import { } from './services/cache.service';
import ws from './services/ws.service.js';

// Modules
import * as express from 'express';
import * as morgan from 'morgan';
import * as cors from 'cors';

import setMongo from './databases/mogodb';
import setRoutes from './routes';

// import * as crypto from 'crypto';
// import * as moment from 'moment';
// import { encryptedData } from './utils/utils';

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
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, info, otp");
  next();
});
app.use(morgan('dev'));
app.set('port', 3000);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const main = async (): Promise<any> => {
  try {
    await setMongo();
    setRoutes(app);
    ws; // Run websocket
    // const time = moment().unix();
    // const hmac = crypto.createHmac('sha256', 'nhom12ibFTP');
    // const hashCreateToken = hmac.update(`nhom12ibFTP${'/api/getInfo/463029405607'}${time}`).digest('hex');
    // const objToken = {
    //   time,
    //   bankName: 'FTP',
    // };
    // const newToken = encryptedData(objToken);
    // console.log('newToken', newToken);
    // console.log('token', hashCreateToken);
    // console.log('time', time);
    app.listen(app.get('port'), () => console.log(`Api Nhom12IB listening on port ${app.get('port')}`));
  } catch (err) {
    console.error(err);
  }
};

main();

export { app };
