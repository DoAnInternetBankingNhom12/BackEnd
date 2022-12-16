import { Request, Response } from 'express';

// Models
import Bank from '../models/bank';

// Utils
import { isNull, decryptedData } from '../utils/utils';
import * as crypto from 'crypto';
import * as moment from 'moment';
import * as lodash from 'lodash';

const verifySK = async (req: Request, res: Response, next: any) => {
  const model = Bank;
  const tokenSK: string = lodash.cloneDeep(req.headers['tokensk'] as string);
  const objEncode: any = decryptedData(tokenSK);
  const token = lodash.cloneDeep(req.headers['token']);
  const time = objEncode.time;
  const bankInfo: any = await model.findOne({ id: objEncode.bankId, _status: true }, { _id: 0, __v: 0, _status: 0 });
  const objBody = lodash.cloneDeep(req.body);

  if (isNull(bankInfo)) {
    return res.status(401).json({
      status: false,
      errors: {
        mgs: "No data bank or no bankId field!"
      }
    });
  }

  if (!time) {
    return res.status(401).json({
      status: false,
      errors: {
        mgs: "No time field!"
      }
    });
  }

  const diffTimeMinutes = moment().diff(moment.unix(time), 'minutes');
  if (diffTimeMinutes >= 15) {
    return res.status(401).json({
      status: false,
      errors: {
        mgs: "Token expiration!"
      }
    });
  }

  if (isNull(token)) {
    return res.status(401).json({
      status: false,
      errors: {
        mgs: "No token field!"
      }
    });
  }

  const key = process.env.SECRET_KEY as string;
  const url = lodash.cloneDeep(req.originalUrl);
  const hmac = crypto.createHmac('sha256', key);
  const hashCreateToken = hmac.update(generalStringToken(key, url, objBody, time)).digest('hex');
  req.body.bankInfo = bankInfo;

  if (hashCreateToken !== token) {
    return res.status(401).json({
      status: false,
      errors: {
        mgs: "Access is not allowed!"
      }
    });
  }

  return next();
};

function generalStringToken(key: string, url: string, objTransaction: any, time : number) {
  let tokenString = `${key}-${url}-`;
  if (objTransaction.sendAccountName) tokenString += objTransaction.sendAccountName + '-';
  if (objTransaction.sendPayAccount) tokenString += objTransaction.sendPayAccount + '-';
  if (objTransaction.receiverPayAccount) tokenString += objTransaction.receiverPayAccount + '-';
  if (objTransaction.amountOwed) tokenString += objTransaction.amountOwed + '-';
  if (objTransaction.payAccountFee) tokenString += objTransaction.payAccountFee + '-';
  if (objTransaction.transactionFee) tokenString += objTransaction.transactionFee;
  tokenString += `-${time}`;
  return tokenString;
}

export default verifySK;
