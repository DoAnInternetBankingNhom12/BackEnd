import { Request, Response } from 'express';

// Utils
import { isNull, decryptedData } from '../utils/utils';
import * as crypto from 'crypto';
import * as moment from 'moment';
import * as lodash from 'lodash';

const verifySK = async (req: Request, res: Response, next: any) => {
  const tokenSK: string = req.headers['tokensk'] as string;
  const objEncode: any = decryptedData(tokenSK);
  const token = req.headers['token'];
  const time = objEncode.time;

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
        mgs: "Token Expiration!"
      }
    });
  }

  if (isNull(token)) {
    return res.status(401).json({
      status: false,
      errors: {
        mgs: "No tokens!"
      }
    });
  }

  const key = process.env.SECRET_KEY as string;
  const url = lodash.cloneDeep(req.originalUrl);
  const hmac = crypto.createHmac('sha256', key);
  const hashCreateToken = hmac.update(`${key}${url}${time}`).digest('hex');

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

export default verifySK;
