import { Request, Response } from 'express';

// Controllers
import BaseCtrl from './base';

// Models
import DebtReminder from '../models/debt_reminder';
import Receiver from '../models/receiver';
import Customer from '../models/customer';
import User from '../models/user';
import Bank from '../models/bank';

// Services
import { sendObjInList } from '../services/ws.service';

// Utils
import * as moment from 'moment';
import * as lodash from 'lodash';
import { isNull } from '../utils/utils';

class DebtReminderCtrl extends BaseCtrl {
  model = DebtReminder;
  modelCustommer = Customer;
  modelUser = User;
  modelReceiver = Receiver;
  modelBank = Bank;
  table = 'reminder';

  // Get
  getMyDebtReminder = async (req: Request, res: Response) => {
    try {
      const user = lodash.cloneDeep(req.body.user);
      if (isNull(user)) {
        return res.status(400).json({
          mgs: `No account to get!`,
          success: false
        });
      }

      const debtReminders = await this.model.find({ userId: user.userId, _status: true }, { id: 0, _id: 0, __v: 0, _status: 0 });

      if (isNull(debtReminders)) {
        return res.status(400).json({
          mgs: 'Empty data debt reminder!',
          success: false
        });
      }

      return res.status(200).json({
        data: debtReminders,
        success: true
      });
    } catch (err: any) {
      return res.status(400).json({
        mgs: `Get my ${this.table} error!`,
        success: false,
        error: err
      });
    }
  }

  // Create
  createDebtReminder = async (req: Request, res: Response) => {
    try {
      const user = lodash.cloneDeep(req.body.user);
      const tempData = lodash.cloneDeep(req.body);
      const id = await this.generateId();
      tempData.id = id;
      tempData.createTime = moment().unix();
      tempData.updateTime = moment().unix();
      tempData.description = !isNull(tempData.description) ? tempData.description : `Chuyển tiền cho tài khoản ${tempData.receiverPayAccount}.`;
      tempData._status = true;
      if (isNull(user)) {
        return res.status(400).json({
          mgs: `No account to get!`,
          success: false
        });
      }

      const bankInfo: any = await this.modelBank.findOne({ type: 'internal', _status: true });
      if (isNull(bankInfo)) {
        return res.status(400).json({
          mgs: `No bank data!`,
          success: false
        });
      }

      tempData.sendBankId = bankInfo.id;
      tempData.sendBankName = bankInfo.name;
      const sentUserData: any = await this.modelCustommer.findOne({ userId: user.userId, _status: true });
      if (isNull(sentUserData)) {
        return res.status(400).json({
          mgs: `Account sent isn't exist!`,
          success: false
        });
      }

      tempData.sendPayAccount = sentUserData.paymentAccount;
      tempData.sendAccountName = sentUserData.name;
      const receiverData: any = await this.modelReceiver.findOne({ numberAccount: tempData.receiverPayAccount, _status: true });
      if (isNull(receiverData)) {
        return res.status(400).json({
          mgs: `Account receiver isn't exist!`,
          success: false
        });
      }

      tempData.receiverBankId = bankInfo.id;
      tempData.receiverBankName = bankInfo.name;
      tempData.receiverAccountName = receiverData.reminiscentName;

      const statusCreate = await new this.model(tempData).save();

      if (isNull(statusCreate)) {
        return res.status(400).json({
          mgs: 'Create debt reminder failed!',
          success: false
        });
      }

      return res.status(200).json({
        mgs: `Create ${this.table} success!`,
        success: true
      });
    } catch (err: any) {
      return res.status(400).json({
        mgs: `Get ${this.table} error!`,
        success: false,
        error: err
      });
    }
  }
}

export default DebtReminderCtrl;
