import { Request, Response } from 'express';

// Controllers
import BaseCtrl from './base';
import TransactionCtrl from './transaction.controller';

// Models
import DebtReminder from '../models/debt_reminder';
import Receiver from '../models/receiver';
import Customer from '../models/customer';
import User from '../models/user';
import Bank from '../models/bank';
import Transaction from '../models/transaction';

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
  modelTransaction = Transaction;
  table = 'reminder';

  // Get
  getMyDebtReminders = async (req: Request, res: Response) => {
    try {
      const user = lodash.cloneDeep(req.body.user);
      if (isNullObj(user)) {
        return res.status(400).json({
          mgs: `No account to get!`,
          success: false
        });
      }

      const debtReminders = await this.model.find({ receiverPayAccount: user.paymentAccount, _status: true }, { _id: 0, __v: 0, _status: 0 }).sort({ updateTime: -1 });

      if (isNullArray(debtReminders)) {
        return res.status(200).json({
          mgs: 'Empty data debt reminder!',
          data: [],
          success: true
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

  getMyIndebtedness = async (req: Request, res: Response) => {
    try {
      const user = lodash.cloneDeep(req.body.user);
      if (isNullObj(user)) {
        return res.status(400).json({
          mgs: `No account to get!`,
          success: false
        });
      }

      const debtReminders = await this.model.find({ sendPayAccount: user.paymentAccount, _status: true }, { _id: 0, __v: 0, _status: 0 }).sort({ updateTime: -1 });

      if (isNullArray(debtReminders)) {
        return res.status(200).json({
          mgs: 'Empty data debt reminder!',
          data: [],
          success: true
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

  getMyIndebtednessUnpaid = async (req: Request, res: Response) => {
    try {
      const user = lodash.cloneDeep(req.body.user);
      if (isNullObj(user)) {
        return res.status(400).json({
          mgs: `No account to get!`,
          success: false
        });
      }

      const debtReminders = await this.model.find({ sendPayAccount: user.paymentAccount, status: 'unpaid', _status: true }, { _id: 0, __v: 0, _status: 0 }).sort({ updateTime: -1 });

      if (isNullArray(debtReminders)) {
        return res.status(200).json({
          mgs: 'Empty data debt reminder!',
          data: [],
          success: true
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
  // Only user in internal bank
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
      tempData.noticeTime = !tempData.noticeTime || moment().unix() > tempData.noticeTime ? moment().unix() : tempData.noticeTime;
      tempData.typeFee = 'sender';
      tempData._status = true;

      const existSentUser: any = await this.modelCustommer.findOne({ paymentAccount: tempData.sendPayAccount, _status: true }).exec();
      if (!existSentUser) {
        return res.status(400).json({
          mgs: `Account sent isn't exist!`,
          success: false
        });
      }

      const receiverData: any = await this.modelCustommer.findOne({ userId: user.userId, _status: true });
      if (isNullObj(receiverData)) {
        return res.status(400).json({
          mgs: `Account receiver isn't exist!`,
          success: false
        });
      }

      tempData.receiverPayAccount = receiverData.paymentAccount;
      tempData.description = !isNull(tempData.description) ? tempData.description : `Chuyển tiền cho tài khoản ${receiverData.paymentAccount}.`;
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
      tempData.noticeTime = moment().unix() > tempData.noticeTime ? moment().unix() : tempData.noticeTime;
      delete tempData.user;

      if (!isNullObj(data)) {
        const sendData: any = await this.modelReceiver.findOne({ paymentAccount: tempData.sendPayAccount, _status: true });
        if (isNullObj(sendData)) {
          return res.status(400).json({
            mgs: `Account receiver isn't exist!`,
            success: false
          });
        }

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

  // Pay
  debtReminderBank = async (req: Request, res: Response) => {
    try {
      const transactionCtrl = new TransactionCtrl();
      const user = lodash.cloneDeep(req.body.user);
      const debtReminderId = lodash.cloneDeep(req.params.id);
      if (isNull(debtReminderId)) {
        return res.status(400).json({
          mgs: `The debt reminder id parameter is empty!`,
          success: false
        });
      }

      const debtReminderData: any = await this.model.findOne({ id: debtReminderId, _status: true, status: 'unpaid' });

      if (isNullObj(debtReminderData)) {
        return res.status(400).json({
          mgs: `No debt reminder data or debt reminder has been paid!`,
          success: false
        });
      }

      if (user.paymentAccount !== debtReminderData.sendPayAccount) {
        return res.status(400).json({
          mgs: `This account is not authorized to make payments!`,
          success: false
        });
      }

      const transactionData: any = {};
      const id = await this.generateIdByTextAndModel('transaction', this.modelTransaction);
      transactionData.id = id;
      transactionData.debtReminderId = debtReminderId;
      transactionData.createTime = moment().unix();
      transactionData.updateTime = moment().unix();
      transactionData.statusTransaction = 'completed';
      transactionData._status = true;
      transactionData.description = debtReminderData.description;
      transactionData.statusMoney = 'delivered';
      transactionData.typeTransaction = 'internal';
      transactionData.transactionFee = 5000;
      transactionData.sendPayAccount = debtReminderData.sendPayAccount;
      transactionData.receiverPayAccount = debtReminderData.receiverPayAccount;
      transactionData.amountOwed = debtReminderData.amountOwed;
      transactionData.typeFee = debtReminderData.typeFee;


      const bankInfo: any = await this.modelBank.findOne({ type: 'internal', _status: true });
      if (isNullObj(bankInfo)) {
        return res.status(400).json({
          mgs: `No bank data!`,
          success: false
        });
      }

      transactionData.sendBankId = bankInfo.id;
      transactionData.sendBankName = bankInfo.name;
      const sentUserData: any = await this.modelCustommer.findOne({ paymentAccount: transactionData.sendPayAccount, _status: true });
      if (isNullObj(sentUserData) || !sentUserData.paymentAccount) {
        return res.status(400).json({
          mgs: `Account sent isn't exist!`,
          success: false
        });
      }

      transactionData.sendPayAccount = sentUserData.paymentAccount;
      transactionData.sendAccountName = sentUserData.name;
      const receiverData: any = await this.modelCustommer.findOne({ paymentAccount: transactionData.receiverPayAccount, _status: true });
      if (isNullObj(receiverData)) {
        return res.status(400).json({
          mgs: `Account receiver isn't exist!`,
          success: false
        });
      }

      switch (transactionData.typeFee) {
        case 'receiver':
          transactionData.payAccountFee = transactionData.receiverPayAccount;
          break;
        default:
          transactionData.payAccountFee = transactionData.sendPayAccount;
          break;
      }

      transactionData.receiverBankId = bankInfo.id;
      transactionData.receiverBankName = bankInfo.name;
      transactionData.receiverAccountName = receiverData.name;
      const amountOwedTotal = transactionData.amountOwed + (sentUserData.paymentAccount === transactionData.payAccountFee ? transactionData.transactionFee : 0);
      const statusCheck = await transactionCtrl.checkAmountOwed(sentUserData.paymentAccount, amountOwedTotal);

      if (!statusCheck) {
        return res.status(400).json({
          mgs: `Account balance is not enough to make a transaction!`,
          success: false
        });
      }

      const accSentRestore = lodash.cloneDeep(await this.modelCustommer.findOne({ paymentAccount: transactionData.sendPayAccount, _status: true }));
      const accReceiverRestore = lodash.cloneDeep(await this.modelCustommer.findOne({ paymentAccount: transactionData.receiverPayAccount, _status: true }));
      const hasSentTransactionFee = (transactionData.sendPayAccount === transactionData.payAccountFee);
      const statusDeduct = await transactionCtrl.deductMoneyAccount(transactionData.sendPayAccount, amountOwedTotal, hasSentTransactionFee ? transactionData.transactionFee : 0);

      if (!statusDeduct) {
        const statusRestore = await transactionCtrl.restoreData(accSentRestore, accReceiverRestore);
        transactionData.statusTransaction = 'failed';
        transactionData.statusMoney = 'not_delivered';
        await new this.model(transactionData).save();
        return res.status(400).json({
          mgs: `Transaction internal failed and restore ${statusRestore ? 'success' : 'failed'}!`,
          success: false
        });
      }

      const hasReceiverTransactionFee = (transactionData.receiverPayAccount === transactionData.payAccountFee);
      const statusAdd = await transactionCtrl.addMoneyAccountInternal(transactionData.receiverPayAccount, amountOwedTotal, hasReceiverTransactionFee ? transactionData.transactionFee : 0);

      if (!statusAdd) {
        const statusRestore = await transactionCtrl.restoreData(accSentRestore, accReceiverRestore);
        transactionData.statusTransaction = 'failed';
        transactionData.statusMoney = 'not_delivered';
        await new this.model(transactionData).save();
        return res.status(400).json({
          mgs: `Transaction internal failed and restore ${statusRestore ? 'success' : 'failed'}!`,
          success: false
        });
      }

      await new this.modelTransaction(transactionData).save();
      await this.model.findOneAndUpdate({ id: debtReminderId }, { status: 'paid' }, { _id: 0, __v: 0, _status: 0 });
      // const objSent: Notify = {
      //   type: 'update',
      //   table: this.table.toLocaleLowerCase(),
      //   msg: `The account has just been transferred from the account ${transactionData.sendAccountName}!`,
      //   data: {
      //     amountOwed: transactionData.amountOwed
      //   }
      // };

      // sendObjInListByPayNumber(objSent, [transactionData.receiverPayAccount])
      return res.status(200).json({
        mgs: `Transaction internal success!`,
        success: true
      });
    } catch (err: any) {
      console.log(err);
      return res.status(400).json({
        mgs: `Transaction internal failed!`,
        success: false,
        error: err
      });
    }
  };

  private getDataUpdate(objData: any) {
    const newObj = {
      sendPayAccount: objData?.sendPayAccount,
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
