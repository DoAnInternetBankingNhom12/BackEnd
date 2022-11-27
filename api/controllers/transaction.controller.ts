import { Request, Response } from 'express';

// Controllers
import BaseCtrl from './base';

// Models
import Transaction from '../models/transaction';

// Utils
import * as moment from 'moment';
import * as lodash from 'lodash';
import { isNull } from '../utils/utils';

class TransactionCtrl extends BaseCtrl {
  model = Transaction;
  table = 'Transaction';

  // Find
  findTransaction = async (req: Request, res: Response) => {
    try {
      const optionSearch = lodash.cloneDeep(req.query);
      const obj = await this.model.find(optionSearch, { _id: 0, __v: 0, _status: 0 });

      if (isNull(obj)) {
        return res.status(400).json({
          mgs: `Get data ${this.table} not exist!`,
          success: false
        });
      }

      return res.status(200).json({
        data: obj,
        success: true
      });
    } catch (err: any) {
      return res.status(400).json({
        mgs: `Get ${this.table} id ${req.body.id} error!`,
        data: req.params.id,
        success: false,
        error: {
          mgs: err.message,
          status: 400,
          code: 5000
        }
      });
    }
  };
}

export default TransactionCtrl;
