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
import { sendObjInListByPayNumber } from '../services/ws.service';

// Interfaces
import { Notify } from 'interfaces/notify.interface.js';

// Utils
import * as moment from 'moment';
import * as lodash from 'lodash';
import { isNull, isNullArray, isNullObj } from '../utils/utils';

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
      if (isNullObj(user)) {
        return res.status(400).json({
          mgs: `No account to get!`,
          success: false
        });
      }

      const debtReminders = await this.model.find({ $or: [{ receiverPayAccount: user.paymentAccount }, { userId: user.userId }], _status: true }, { _id: 0, __v: 0, _status: 0 });

      if (isNullArray(debtReminders)) {
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
      if (isNullObj(user)) {
        return res.status(400).json({
          mgs: `No account to get!`,
          success: false
        });
      }
      const tempData = lodash.cloneDeep(req.body);
      const id = await this.generateId();
      tempData.id = id;
      tempData.userId = user.userId;
      tempData.createTime = moment().unix();
      tempData.updateTime = moment().unix();
      tempData.description = !isNull(tempData.description) ? tempData.description : `Chuyển tiền cho tài khoản ${tempData.receiverPayAccount}.`;
      tempData._status = true;

      const bankInfo: any = await this.modelBank.findOne({ type: 'internal', _status: true });
      if (isNullObj(bankInfo)) {
        return res.status(400).json({
          mgs: `No bank data!`,
          success: false
        });
      }

      tempData.sendBankId = bankInfo.id;
      tempData.sendBankName = bankInfo.name;
      const sentUserData: any = await this.modelCustommer.findOne({ userId: user.userId, _status: true });
      if (isNullObj(sentUserData)) {
        return res.status(400).json({
          mgs: `Account sent isn't exist!`,
          success: false
        });
      }

      tempData.sendPayAccount = sentUserData.paymentAccount;
      tempData.sendAccountName = sentUserData.name;
      const receiverData: any = await this.modelReceiver.findOne({ paymentAccount: tempData.receiverPayAccount, _status: true });
      if (isNullObj(receiverData)) {
        return res.status(400).json({
          mgs: `Account receiver isn't exist!`,
          success: false
        });
      }

      const bankReceiverInfo: any = await this.modelBank.findOne({ id: receiverData.bankId, _status: true });
      if (isNullObj(bankReceiverInfo)) {
        return res.status(400).json({
          mgs: `No bank data!`,
          success: false
        });
      }

      tempData.receiverBankId = bankReceiverInfo.id;
      tempData.receiverBankName = bankReceiverInfo.name;
      tempData.receiverAccountName = receiverData.reminiscentName;

      const statusCreate = await new this.model(tempData).save();

      if (isNullObj(statusCreate)) {
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

  // Update
  updateDebtReminder = async (req: Request, res: Response) => {
    try {
      const data: any = await this.model.findOne({ id: req.params.id });
      const tempData = lodash.cloneDeep(req.body);
      delete tempData.user;

      if (!isNullObj(data)) {
        const receiverData: any = await this.modelReceiver.findOne({ paymentAccount: tempData.receiverPayAccount, _status: true });
        if (isNullObj(receiverData)) {
          return res.status(400).json({
            mgs: `Account receiver isn't exist!`,
            success: false
          });
        }
  
        const bankReceiverInfo: any = await this.modelBank.findOne({ id: receiverData.bankId, _status: true });
        if (isNullObj(bankReceiverInfo)) {
          return res.status(400).json({
            mgs: `No bank data!`,
            success: false
          });
        }
  
        tempData.receiverBankId = bankReceiverInfo.id;
        tempData.receiverBankName = bankReceiverInfo.name;
        tempData.receiverAccountName = receiverData.reminiscentName;

        const objUpdate = lodash.cloneDeep(this.getDataUpdate(tempData))

        await this.model.findOneAndUpdate({ id: req.params.id }, objUpdate, { _id: 0, __v: 0, _status: 0 });

        const objSent: Notify = {
          type: 'update',
          table: this.table.toLocaleLowerCase(),
          msg: `Debt ${this.table} has change data!`
        };

        sendObjInListByPayNumber(objSent, [data.receiverPayAccount]);
        return res.status(200).json({
          mgs: `Update user id ${req.params.id} success!`,
          success: true
        });
      }

      return res.status(400).json({
        mgs: `Not exist ${this.table} id ${req.params.id} to update!`,
        data: tempData,
        success: false,
      });
    } catch (err: any) {
      return res.status(400).json({
        mgs: `Update ${this.table} id ${req.params.id} error!`,
        success: false,
        error: err
      });
    }
  };

  private getDataUpdate(objData: any) {
    const newObj = {
      receiverPayAccount: objData?.receiverPayAccount,
      receiverAccountName: objData?.receiverPayAccount,
      receiverBankId: objData?.receiverBankId,
      receiverBankName: objData?.receiverBankName,
      payAccountFee: objData?.payAccountFee,
      transactionFee: objData?.transactionFee,
      amountOwed: objData?.amountOwed,
      description: objData?.description,
      noticeTime: objData?.noticeTime,
      updateTime: moment().unix(),
      _status: true,
    };

    return newObj;
  }

  // export interface DebtReminder extends Document {
  //   id: string,
  //   userId: string,
  //   sendPayAccount: string,
  //   sendAccountName: string,
  //   sendBankId: string,
  //   sendBankName: string,
  //   receiverPayAccount: string,
  //   receiverAccountName: string,
  //   receiverBankId: string,
  //   receiverBankName: string,
  //   payAccountFee: string,
  //   transactionFee: number,
  //   amountOwed: number,
  //   description: string,
  //   noticeTime: number,
  //   createTime: number,
  //   updateTime: number,
  //   _status: boolean
  // };
}

export default DebtReminderCtrl;
