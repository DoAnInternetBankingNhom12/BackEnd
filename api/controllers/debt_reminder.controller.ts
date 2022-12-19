import { Request, Response } from 'express';

// Controllers
import BaseCtrl from './base';

// Models
import DebtReminder from '../models/debt_reminder';

// Services
import { sendObjInList } from '../services/ws.service';

// Utils
import * as moment from 'moment';
import * as lodash from 'lodash';
import { isNull } from '../utils/utils';

class DebtReminderCtrl extends BaseCtrl {
  model = DebtReminder;
  table = 'Debt reminder';

  // Get
  getMyDebtReminder = async (req: Request, res: Response) => {
    try {
      const paymentAccount = lodash.cloneDeep(req.params.paymentAccount);

      if (isNull(paymentAccount)) {
        return res.status(400).json({
          mgs: `No payment account to get!`,
          success: false
        });
      }

      const account = await this.model.findOne({paymentAccount: paymentAccount, _status: true }, { id:0, _id: 0, __v: 0, _status: 0, userId: 0, accountBalance: 0, createTime: 0, updateTime: 0});
      
      if (isNull(account)) {
        return res.status(400).json({
          mgs: 'Payment account not exist!',
          success: false
        });
      }

      return res.status(200).json({
        data: account,
        success: true
      });
    } catch (err: any) {
      return res.status(400).json({
        mgs: `Get account ${this.table} error!`,
        success: false,
        error: err
      });
    }
  }
}

export default DebtReminderCtrl;
