import { Request, Response } from 'express';

// Controllers
import BaseCtrl from './base';
import PartnerCtrl from './partner.controller';

// Models
import TransactionModel from '../models/transaction';
import Receiver from '../models/receiver';
import Customer from '../models/customer';
import User from '../models/user';
import Bank from '../models/bank';

// Services
import { sendObjInListByPayNumber } from '../services/ws.service'

// Interfaces
import { Notify } from '../interfaces/notify.interface';

// Utils
import * as http from 'http';
import * as moment from 'moment';
import * as lodash from 'lodash';
import { encryptedStringST, getTokenPartner, isNull, isNullObj, verifyMySignature } from '../utils/utils';

class TransactionCtrl extends BaseCtrl {
  model = TransactionModel;
  modelCustommer = Customer;
  modelUser = User;
  modelReceiver = Receiver;
  modelBank = Bank;
  table = 'Transaction';

  // Get
  getMyTransactionMoneyTransfer = async (req: Request, res: Response) => {
    try {
      const user: any = lodash.cloneDeep(req.body.user);
      const obj = await this.model.find({ $or: [{ sendPayAccount: user.paymentAccount }], _status: true }, { _id: 0, __v: 0, _status: 0 });

      if (isNullObj(obj)) {
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

  getMyTransactionMoneyGet = async (req: Request, res: Response) => {
    try {
      const user: any = lodash.cloneDeep(req.body.user);
      const obj = await this.model.find({ $or: [{ receiverPayAccount: user.paymentAccount }], _status: true }, { _id: 0, __v: 0, _status: 0 });

      if (isNullObj(obj)) {
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

  getTransactionExternal = async (req: Request, res: Response) => {
    try {
      let startTime = lodash.cloneDeep(req.body ? req.body.startTime : moment().startOf('month').unix());
      let endTime = lodash.cloneDeep(req.body ? req.body.endTime : moment().endOf('month').unix());

      if (isNull(startTime)) {
        startTime = moment().startOf('month').unix();
      }

      if (isNull(endTime)) {
        endTime = moment().endOf('month').unix();
      }

      const obj = await this.model.find({ typeTransaction: 'external', createTime: { $gte: startTime, $lt: endTime }, _status: true }, { _id: 0, __v: 0, _status: 0 });

      if (isNullObj(obj)) {
        return res.status(200).json({
          mgs: `Get data is empty!`,
          data: [],
          success: true
        });
      }

      return res.status(200).json({
        mgs: `Get data ${this.table} is success!`,
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

  // Find
  findTransaction = async (req: Request, res: Response) => {
    try {
      const optionSearch = lodash.cloneDeep(req.query);
      const obj = await this.model.find(optionSearch, { _id: 0, __v: 0, _status: 0 });

      if (isNullObj(obj)) {
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

  internalBank = async (req: Request, res: Response) => {
    try {
      const user = lodash.cloneDeep(req.body.user);
      const tempData = lodash.cloneDeep(req.body);
      const id = await this.generateId();
      tempData.id = id;
      tempData.createTime = moment().unix();
      tempData.updateTime = moment().unix();
      tempData.statusTransaction = 'completed';
      tempData._status = true;
      tempData.description = !isNull(tempData.description) ? tempData.description : `Chuyển tiền cho tài khoản ${tempData.receiverPayAccount}.`;
      tempData.statusMoney = 'delivered';
      tempData.typeTransaction = 'internal';
      tempData.transactionFee = 5000;
      delete tempData.user;

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
      if (isNullObj(sentUserData) || !sentUserData.paymentAccount) {
        return res.status(400).json({
          mgs: `Account sent isn't exist!`,
          success: false
        });
      }

      tempData.sendPayAccount = sentUserData.paymentAccount;
      tempData.sendAccountName = sentUserData.name;
      const receiverData: any = await this.modelCustommer.findOne({ paymentAccount: tempData.receiverPayAccount, _status: true });
      if (isNullObj(receiverData)) {
        return res.status(400).json({
          mgs: `Account receiver isn't exist!`,
          success: false
        });
      }

      switch (tempData.typeFee) {
        case 'receiver':
          tempData.payAccountFee = tempData.receiverPayAccount;
          break;
        default:
          tempData.payAccountFee = tempData.sendPayAccount;
          break;
      }

      tempData.receiverBankId = bankInfo.id;
      tempData.receiverBankName = bankInfo.name;
      tempData.receiverAccountName = receiverData.name;
      const amountOwedTotal = tempData.amountOwed + (sentUserData.paymentAccount === tempData.payAccountFee ? tempData.transactionFee : 0);
      const statusCheck = await this.checkAmountOwed(sentUserData.paymentAccount, amountOwedTotal);

      if (!statusCheck) {
        return res.status(400).json({
          mgs: `Account balance is not enough to make a transaction!`,
          success: false
        });
      }

      const accSentRestore = lodash.cloneDeep(await this.modelCustommer.findOne({ paymentAccount: tempData.sendPayAccount, _status: true }));
      const accReceiverRestore = lodash.cloneDeep(await this.modelCustommer.findOne({ paymentAccount: tempData.receiverPayAccount, _status: true }));
      const hasSentTransactionFee = (tempData.sendPayAccount === tempData.payAccountFee);
      const statusDeduct = await this.deductMoneyAccount(tempData.sendPayAccount, amountOwedTotal, hasSentTransactionFee ? tempData.transactionFee : 0);

      if (!statusDeduct) {
        const statusRestore = await this.restoreData(accSentRestore, accReceiverRestore);
        tempData.statusTransaction = 'failed';
        tempData.statusMoney = 'not_delivered';
        await new this.model(tempData).save();
        return res.status(400).json({
          mgs: `Transaction internal failed and restore ${statusRestore ? 'success' : 'failed'}!`,
          success: false
        });
      }

      const hasReceiverTransactionFee = (tempData.receiverPayAccount === tempData.payAccountFee);
      const statusAdd = await this.addMoneyAccountInternal(tempData.receiverPayAccount, amountOwedTotal, hasReceiverTransactionFee ? tempData.transactionFee : 0);

      if (!statusAdd) {
        const statusRestore = await this.restoreData(accSentRestore, accReceiverRestore);
        tempData.statusTransaction = 'failed';
        tempData.statusMoney = 'not_delivered';
        await new this.model(tempData).save();
        return res.status(400).json({
          mgs: `Transaction internal failed and restore ${statusRestore ? 'success' : 'failed'}!`,
          success: false
        });
      }

      await new this.model(tempData).save();
      const objSent: Notify = {
        type: 'update',
        table: this.table.toLocaleLowerCase(),
        msg: `The account has just been transferred from the account ${tempData.sendAccountName}!`,
        data: {
          amountOwed: tempData.amountOwed
        }
      };

      sendObjInListByPayNumber(objSent, [tempData.receiverPayAccount])
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

  externalBank = async (req: Request, res: Response) => {
    try {
      const partnerCtrl = new PartnerCtrl();
      const tempData = lodash.cloneDeep(req.body);
      const id = await this.generateId();
      tempData.id = id;
      tempData.createTime = moment().unix();
      tempData.updateTime = moment().unix();
      tempData.statusTransaction = 'completed';
      tempData._status = true;
      tempData.description = !isNull(tempData.description) ? tempData.description : `Chuyển tiền cho tài khoản ${tempData.receiverPayAccount}.`;
      tempData.statusMoney = 'delivered';
      tempData.typeTransaction = 'external';
      delete tempData.user;

      const myBankInfo: any = await this.modelBank.findOne({ type: 'internal', _status: true });
      if (isNull(myBankInfo)) {
        return res.status(400).json({
          mgs: `No bank data!`,
          success: false
        });
      }

      tempData.sendBankId = myBankInfo.id;
      tempData.sendBankName = myBankInfo.name;
      const sentUserData: any = await this.modelCustommer.findOne({ paymentAccount: tempData.sendPayAccount, _status: true });
      if (isNull(sentUserData)) {
        return res.status(400).json({
          mgs: `Account sent isn't exist!`,
          success: false
        });
      }

      tempData.sendPayAccount = sentUserData.paymentAccount;
      tempData.sendAccountName = sentUserData.name;
      // Here for test
      // Check data receiver exist in may data.
      const receiverData: any = await this.modelCustommer.findOne({ paymentAccount: tempData.receiverPayAccount, _status: true }); // Just test
      if (isNull(receiverData)) {
        const dataPartner: any = partnerCtrl.getInfoHttp(tempData.receiverPayAccount);
        if (!dataPartner || dataPartner.status === 0 || dataPartner.data === null) {
          return res.status(400).json({
            mgs: `Account receiver isn't exist!`,
            success: false
          });
        }
        return res.status(400).json({
          mgs: `Account receiver isn't exist!`,
          success: false
        });
      }

      const partnerBankInfo: any = await this.modelBank.findOne({ id: receiverData.bankId, _status: true });
      if (isNull(partnerBankInfo)) {
        return res.status(400).json({
          mgs: `No partner bank data!`,
          success: false
        });
      }

      tempData.receiverBankId = partnerBankInfo.id;
      tempData.receiverBankName = partnerBankInfo.name;
      tempData.receiverAccountName = receiverData.name;
      const amountOwedTotal = tempData.amountOwed + (sentUserData.paymentAccount === tempData.payAccountFee ? tempData.transactionFee : 0)
      const statusCheck = await this.checkAmountOwed(sentUserData.paymentAccount, amountOwedTotal);

      if (!statusCheck) {
        return res.status(400).json({
          mgs: `Account balance is not enough to make a transaction!`,
          success: false
        });
      }

      const accSentRestore = lodash.cloneDeep(await this.modelCustommer.findOne({ paymentAccount: tempData.sendPayAccount, _status: true }));
      const accReceiverRestore = lodash.cloneDeep(await this.modelCustommer.findOne({ paymentAccount: tempData.receiverPayAccount, _status: true }));
      const hasSentTransactionFee = (tempData.sendPayAccount === tempData.payAccountFee);
      const statusDeduct = await this.deductMoneyAccount(tempData.sendPayAccount, amountOwedTotal, hasSentTransactionFee ? tempData.transactionFee : 0);

      if (!statusDeduct) {
        const statusRestore = await this.restoreData(accSentRestore, accReceiverRestore);
        tempData.statusTransaction = 'failed';
        tempData.statusMoney = 'not_delivered';
        await new this.model(tempData).save();
        return res.status(400).json({
          mgs: `Transaction external failed and restore ${statusRestore ? 'success' : 'failed'}!`,
          success: false
        });
      }

      const hasReceiverTransactionFee = (tempData.receiverPayAccount === tempData.payAccountFee);
      // Here Partner bank's API add money
      const newAmountOwed: number = hasReceiverTransactionFee ? tempData.amountOwed - tempData.transactionFee : tempData.amountOwed;
      const stringSignaturePartner = `${tempData.sendPayAccount}${newAmountOwed}${tempData.receiverAccountName}`;
      const signaturePartner = encryptedStringST(stringSignaturePartner, 'bank1');
      const objDataPartner = {
        send_STK: tempData.sendPayAccount,
        send_Money: newAmountOwed,
        receive_BankID: 2,
        receive_STK: tempData.receiverAccountName,
        content: tempData.description,
        paymentFeeTypeID: 1,
        transactionTypeID: 1,
        bankReferenceId: 0,
        rsa: signaturePartner
      };
      // const statusAdd = await this.addMoneyAccountInternal(tempData.receiverPayAccount, amountOwedTotal, hasReceiverTransactionFee ? tempData.transactionFee : 0); // Just test
      const statusAddPartner = await this.postTransactionHttp(objDataPartner, signaturePartner);
      if (!statusAddPartner) {
        const statusRestore = await this.restoreData(accSentRestore, accReceiverRestore);
        tempData.statusTransaction = 'failed';
        tempData.statusMoney = 'not_delivered';
        await new this.model(tempData).save();
        return res.status(400).json({
          mgs: `Transaction external failed and restore ${statusRestore ? 'success' : 'failed'}!`,
          success: false
        });
      }

      await new this.model(tempData).save();

      return res.status(200).json({
        mgs: `Transaction external success!`,
        success: true
      });
    } catch (err: any) {
      console.log(err);
      return res.status(400).json({
        mgs: `Transaction external failed!`,
        success: false,
        error: err
      });
    }
  };

  addMoneyPartner = async (req: Request, res: Response) => {
    try {
      const tempData = lodash.cloneDeep(req.body);
      const signature = lodash.cloneDeep(req.headers['signature'] as string)
      const id = await this.generateId();
      tempData.id = id;
      tempData.createTime = moment().unix();
      tempData.updateTime = moment().unix();
      tempData.statusTransaction = 'completed';
      tempData._status = true;
      tempData.description = !isNull(tempData.description) ? tempData.description : `Chuyển tiền cho tài khoản ${tempData.receiverPayAccount}.`;
      tempData.statusMoney = 'not_delivered';
      tempData.typeTransaction = 'external';
      const partnerBankInfo: any = await this.modelBank.findOne({ id: tempData.bankReferenceId, _status: true }, { _id: 0, __v: 0, _status: 0 });

      if (isNullObj(partnerBankInfo)) {
        return res.status(401).json({
          status: false,
          errors: {
            mgs: "No data bank or no bankReferenceId body!"
          }
        });
      }

      if (!signature) {
        return res.status(401).json({
          status: false,
          errors: {
            mgs: "No signature field in headers!"
          }
        });
      }

      const isVeifyST = verifyMySignature(signature);
      if (!isVeifyST) {
        return res.status(401).json({
          status: false,
          errors: {
            mgs: "Signature does not match!"
          }
        });
      }

      tempData.signature = signature;

      const myBankInfo: any = await this.modelBank.findOne({ type: 'internal', _status: true });
      if (isNullObj(myBankInfo)) {
        return res.status(400).json({
          mgs: `No bank data!`,
          success: false
        });
      }

      tempData.sendBankId = partnerBankInfo.id;
      tempData.sendBankName = partnerBankInfo.name;
      if (isNull(tempData.sendPayAccount) || isNull(tempData.sendAccountName)) {
        return res.status(400).json({
          mgs: `Account sent isn't exist!`,
          success: false
        });
      }

      const customerData: any = await this.modelCustommer.findOne({ paymentAccount: tempData.receiverPayAccount, _status: true });
      if (isNullObj(customerData)) {
        return res.status(400).json({
          mgs: `Account receiver isn't exist!`,
          success: false
        });
      }

      tempData.receiverBankId = myBankInfo.id;
      tempData.receiverBankName = myBankInfo.name;
      tempData.receiverAccountName = customerData.name;
      const amountOwedTotal = tempData.amountOwed + (tempData.receiverPayAccount === tempData.payAccountFee ? tempData.transactionFee : 0)

      const accReceiverRestore = lodash.cloneDeep(await this.modelCustommer.findOne({ paymentAccount: tempData.receiverPayAccount, _status: true }));
      const hasReceiverTransactionFee = (tempData.receiverPayAccount === tempData.payAccountFee);
      const statusAdd = await this.addMoneyAccountInternal(tempData.receiverPayAccount, amountOwedTotal, hasReceiverTransactionFee ? tempData.transactionFee : 0);

      if (!statusAdd) {
        const statusRestore = await this.restoreData(undefined, accReceiverRestore);
        tempData.statusTransaction = 'failed';
        tempData.statusMoney = 'not_delivered';
        await new this.model(tempData).save();
        return res.status(400).json({
          mgs: `Transaction add money failed and restore ${statusRestore ? 'success' : 'failed'}!`,
          success: false
        });
      }

      delete tempData.bankInfo;
      await new this.model(tempData).save();
      return res.status(200).json({
        mgs: `Transaction add money success!`,
        success: true
      });
    } catch (err: any) {
      console.log(err);
      return res.status(400).json({
        mgs: `Transaction add money failed!`,
        success: false,
        error: err
      });
    }
  };

  private postTransactionHttp(objData: any, signaturePartner: string) {
    return new Promise((resolve) => {
      const time = moment().unix().toString();
      const stringObj = JSON.stringify(objData);
      const options = {
        host: '52.147.195.180',
        port: '8091',
        path: '/api/External/ExternalTranfer',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(stringObj),
          Token: getTokenPartner(time, 'bank1'),
          Time: time,
          Signature: signaturePartner,
        }
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          data += chunk.toString();
        });
        res.on('end', () => {
          resolve(JSON.parse(data));
        });
      }).on('error', (err: any) => {
        console.log('Error: ' + err.message);
        resolve(undefined);
      });
      req.write(stringObj);
      req.end();
    });
  }

  private async checkAmountOwed(paymentAccount: string, amountOwed: number) {
    try {
      const data = await this.modelCustommer.aggregate([{ $match: { paymentAccount: paymentAccount, accountBalance: { $gte: amountOwed }, _status: true } },]);
      if (isNullObj(data)) return false;
      return true;
    } catch (err: any) {
      console.log('err', err);
      return false;
    }
  }

  private async deductMoneyAccount(paymentAccount: string, money: number, transactionFee: number = 0) {
    try {
      const account: any = await this.modelCustommer.findOne({ paymentAccount: paymentAccount, _status: true });
      if (isNullObj(account)) return false;

      money = Math.abs(money);
      transactionFee = Math.abs(transactionFee);
      const newAmountOwed: number = account.accountBalance - money - transactionFee;
      await this.modelCustommer.findOneAndUpdate({ paymentAccount: paymentAccount }, { accountBalance: newAmountOwed }, { _id: 0, __v: 0, _status: 0 });
      return true;
    } catch (err: any) {
      console.log(err);
      return false;
    }
  }

  private async addMoneyAccountInternal(paymentAccount: string, money: number, transactionFee: number = 0) {
    try {
      const account: any = await this.modelCustommer.findOne({ paymentAccount: paymentAccount, _status: true });
      if (isNullObj(account)) return false;

      money = Math.abs(money);
      transactionFee = Math.abs(transactionFee);
      const newAmountOwed: number = account.accountBalance + money - transactionFee;
      await this.modelCustommer.findOneAndUpdate({ paymentAccount: paymentAccount }, { accountBalance: newAmountOwed }, { _id: 0, __v: 0, _status: 0 });
      return true;
    } catch (err: any) {
      console.log(err);
      return false;
    }
  }

  private async restoreData(infoAccSent?: any, infoAccReceiver?: any) {
    try {
      if (isNullObj(infoAccSent) && isNullObj(infoAccSent)) return true;

      if (!isNullObj(infoAccSent)) {
        const accountSent: any = await this.modelCustommer.findOne({ paymentAccount: infoAccSent.paymentAccount, _status: true });
        if (!isNull(accountSent)) {
          await this.modelCustommer.findOneAndUpdate({ paymentAccount: infoAccSent.paymentAccount }, infoAccSent);
        }
      }

      if (!isNullObj(infoAccSent)) {
        const accountReceiver: any = await this.modelCustommer.findOne({ paymentAccount: infoAccReceiver.paymentAccount, _status: true });
        if (!isNull(accountReceiver)) {
          await this.modelCustommer.findOneAndUpdate({ paymentAccount: infoAccReceiver.paymentAccount }, infoAccReceiver);
        }
      }

      return true;
    } catch (err: any) {
      console.log(err);
      return false;
    }
  }
}

export default TransactionCtrl;
