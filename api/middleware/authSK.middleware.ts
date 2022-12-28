import { Request, Response } from 'express';

// Utils
import { isNull } from '../utils/utils';
import * as crypto from 'crypto';
import * as moment from 'moment';
import * as lodash from 'lodash';

const verifySK = async (req: Request, res: Response, next: any) => {
  const token = lodash.cloneDeep(req.headers['token']);
  const time = Number(lodash.cloneDeep(req.headers['time']));
  const objBody = lodash.cloneDeep(req.body);

  if (!time) {
    return res.status(401).json({
      status: false,
      errors: {
        mgs: "No time field!"
      }
    });
  }

  const timeClone = lodash.cloneDeep(time);
  const diffTimeMinutes = moment().diff(moment.unix(timeClone), 'minutes');
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
  const hmac = crypto.createHash('sha256');
  const hashCreateToken = hmac.update(generalStringToken(key, url, objBody, time)).digest('base64');

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

function generalStringToken(key: string, url: string, objTransaction: any, time: number) {
  let tokenString = `${key}${url}`;
  if (objTransaction.sendPayAccount) tokenString += objTransaction.sendPayAccount;
  if (objTransaction.sendAccountName) tokenString += objTransaction.sendAccountName;
  if (objTransaction.receiverPayAccount) tokenString += objTransaction.receiverPayAccount;
  if (objTransaction.typeFee) tokenString += objTransaction.typeFee;
  if (objTransaction.amountOwed) tokenString += objTransaction.amountOwed;
  if (objTransaction.bankReferenceId) tokenString += objTransaction.bankReferenceId;
  tokenString += `${time}`;
  return tokenString;
}

export default verifySK;
