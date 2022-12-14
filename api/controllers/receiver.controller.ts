import { Request, Response } from 'express';

// Models
import Receiver from '../models/receiver';
import Customer from '../models/customer';
import User from '../models/user';
import Bank from '../models/bank';

// Controllers
import BaseCtrl from './base';
import PartnerCtrl from './partner.controller';

// Interfaces
import { Notify } from '../interfaces/notify.interface';


// Utils
import * as moment from 'moment';
import * as lodash from 'lodash';
import { isNull, getPipeLineGet, isNullObj } from '../utils/utils';


class ReceiverCtrl extends BaseCtrl {
  model = Receiver;
  modelUser = User;
  modelCustomer = Customer;
  modelBank = Bank;
  table = 'Receiver';

  lookups = [
    {
      from: 'bank',
      localField: 'bankId',
      foreignField: 'id',
      as: 'bankName',
      pipeline: [
        { $project: { _id: 0, _status: 0, __v: 0, phoneNumbers: 0, addresses: 0, createTime: 0, updateTime: 0, id: 0 } }
      ],
    }
  ];

  sets = [
    {
      bankName: { $arrayElemAt: ['$bankName.name', 0] }
    },
  ];

  getReceiverByToken = async (req: Request, res: Response) => {
    try {
      const user = lodash.cloneDeep(req.body.user);

      if (!user || !user.userId) {
        return res.status(200).json({
          mgs: `No information to get my receiver!`,
          success: false
        });
      }

      const data = await this.model.aggregate(getPipeLineGet([], { userId: user.userId, _status: true }, this.lookups, this.sets));
      if (!data || data.length === 0) {
        return res.status(200).json({
          mgs: `Get receivers success but is empty!`,
          data: [],
          success: true
        });
      }

      return res.status(200).json({
        mgs: `Get receivers success!`,
        data,
        success: true
      });
    } catch (err: any) {
      return res.status(200).json({
        mgs: `Get receivers error!`,
        error: err,
        success: false
      });
    }
  }

  // Insert
  createReceiver = async (req: Request, res: Response) => {
    try {
      const user = lodash.cloneDeep(req.body.user);

      if (isNullObj(user)) {
        return res.status(400).json({
          mgs: `No account data to generate receiver!`,
          success: false
        });
      }

      const tempData = lodash.cloneDeep(req.body);
      delete tempData.user;
      const existIsDelete = await this.model.findOne({ userId: user.userId, paymentAccount: tempData.paymentAccount, _status: false }).exec();
      const exist = await this.model.findOne({ userId: user.userId, paymentAccount: tempData.paymentAccount, _status: true }).exec();

      if (exist) {
        return res.status(400).json({
          mgs: `Receiver is exist by paymentAccount ${tempData.paymentAccount}!`,
          success: false
        });
      }

      if (existIsDelete) {
        const objUpdate: any = {};
        const bankType = await this.getTypeBank(tempData.bankId);

        if (!bankType) {
          return res.status(400).json({
            mgs: `No bank data to create receiver!`,
            success: false
          });
        }

        if (!isNull(tempData.reminiscentName)) {
          objUpdate.reminiscentName = tempData.reminiscentName;
        } else {
          const customer = await this.getCustomer('paymentAccount', tempData.paymentAccount);
          if (!customer) {
            return res.status(400).json({
              mgs: `No customer name data to generate receiver!`,
              success: false
            });
          }

          objUpdate.reminiscentName = customer.name;
        }


        objUpdate.bankId = tempData.bankId;
        objUpdate.remittanceType = bankType;
        objUpdate.updateTime = moment().unix();
        objUpdate._status = true;


        const dataUpdate: any = await this.model.findOneAndUpdate({  userId: user.userId, paymentAccount: tempData.paymentAccount }, objUpdate);
        dataUpdate.__v = undefined;
        dataUpdate._status = undefined;
        dataUpdate.reminiscentName = objUpdate.reminiscentName;
        return res.status(201).json({
          mgs: `Create ${this.table} paymentAccount ${tempData.paymentAccount} success!`,
          data: dataUpdate,
          success: true
        });
      }

      const bankType = await this.getTypeBank(tempData.bankId);
      if (!bankType) {
        return res.status(400).json({
          mgs: `No bank data to create receiver!`,
          success: false
        });
      }

      const customer = await this.getCustomer('paymentAccount', tempData.paymentAccount);
      const partnerCtrl = new PartnerCtrl();
      const resPartner: any = await partnerCtrl.getInfoHttp(tempData.paymentAccount);
      if (!customer && !resPartner) {
        return res.status(400).json({
          mgs: `No customer data to create receiver!`,
          success: false
        });
      }
      const customerPartner: any = resPartner.data;
      const name = customer ? customer.name : customerPartner.name;
      const id = await this.generateId();
      tempData.id = id;
      tempData.userId = user.userId
      tempData.remittanceType = bankType;
      tempData.name = name;
      tempData.createTime = moment().unix();
      tempData.updateTime = moment().unix();
      tempData._status = true;

      if (isNull(tempData.reminiscentName)) {
        tempData.reminiscentName = name;
      }

      const obj: any = await new this.model(tempData).save();
      obj.__v = undefined;
      obj._status = undefined;
      return res.status(201).json({
        mgs: `Create ${this.table} paymentAccount ${obj.paymentAccount} success!`,
        data: obj,
        success: true
      });
    } catch (err: any) {

      if (err && err.code === 11000) {
        return res.status(400).json({
          msg: `${this.table} ${Object.keys(err.keyValue)} ${Object.values(err.keyValue)} is exist!`,
          success: false,
          error: {
            mgs: `Tr??ng d??? li???u ${Object.keys(err.keyValue)}`,
            code: 11000
          }
        });
      }

      return res.status(400).json({
        mgs: `Create ${this.table} id ${req.body.id} error!`,
        success: false,
        error: err
      });
    }
  };

  // Update
  updateReceiver = async (req: Request, res: Response) => {
    try {
      const isExist = await this.model.findOne({ id: req.params.id, userId: req.body.user.userId }).exec();
      const obj: any = {};

      if (isExist) {
        const tempData = lodash.cloneDeep(req.body);
        tempData.updateTime = moment().unix();
        tempData._status = true;

        const bankType = await this.getTypeBank(tempData.bankId);
        if (!bankType) {
          return res.status(400).json({
            mgs: `No bank data to update receiver!`,
            success: false
          });
        }

        obj.bankId = tempData.bankId;
        obj.remittanceType = bankType;

        if (!isNull(tempData.reminiscentName)) {
          obj.reminiscentName = tempData.reminiscentName;
        }

        const dataUpdate: any = await this.model.findOneAndUpdate({ id: req.params.id }, obj);
        return res.status(200).json({
          mgs: `Update ${this.table} id ${req.params.id} success!`,
          success: true
        });
      }

      return res.status(400).json({
        mgs: `Not exist ${this.table} id ${req.params.id} to update!`,
        success: false
      });
    } catch (err: any) {
      return res.status(400).json({
        mgs: `Update ${this.table} id ${req.params.id} error!`,
        success: false,
        error: err
      });
    }
  };

  private async getTypeBank(bankId: string) {
    try {
      const bank = await this.modelBank.findOne({ id: bankId, _status: true });

      if (!bank || !bank.type) {
        return undefined
      }

      return bank.type;
    } catch (err: any) {
      return undefined;
    }
  }

  private async getCustomer(property: string, value: any) {
    try {
      const option: any = { _status: true };
      option[`${property}`] = value;

      const customer = await this.modelCustomer.findOne(option);

      if (!customer) {
        return undefined
      }

      return customer;
    } catch (err: any) {
      return undefined;
    }
  }
}

export default ReceiverCtrl;
