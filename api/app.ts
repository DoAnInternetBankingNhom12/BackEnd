import * as dotenv from 'dotenv';
dotenv.config();

import * as express from 'express';
import * as morgan from 'morgan';
import * as cors from 'cors';

import setMongo from './databases/mogodb';
import setRoutes from './routes';

import {encryptedData, decryptedData} from './utils/utils';


const corsOptions = {
  origin: 'http://localhost:4200',
  optionsSuccessStatus: 200
};

const app = express();
app.use(cors(corsOptions));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});
app.use(morgan('dev'));
app.set('port', (process.env.PORT || 3000));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const main = async (): Promise<any> => {
  try {
    await setMongo();
    setRoutes(app);
    const dataEncrypted = encryptedData('hola');
    const dataDecrypted = decryptedData(dataEncrypted);
    console.log('dataEncrypted', dataEncrypted);
    console.log('dataDecrypted', dataDecrypted);

    app.listen(app.get('port'), () => console.log(`Api Nhom12IB listening on port ${app.get('port')}`));
  } catch (err) {
    console.error(err);
  }
};

main();

export { app };
