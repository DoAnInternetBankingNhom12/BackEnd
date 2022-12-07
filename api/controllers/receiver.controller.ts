import { Request, Response } from 'express';

// Models
import Receiver from '../models/receiver';
import Customer from '../models/customer';
import User from '../models/user';
import Bank from '../models/bank';

// Controllers
import BaseCtrl from './base';

// Utils
import * as moment from 'moment';
import * as lodash from 'lodash';
import { isNull, getPipeLineGet } from '../utils/utils';


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

      const data = await this.model.aggregate(getPipeLineGet([], { userId: user.userId }, this.lookups, this.sets))

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

      if (isNull(user)) {
        return res.status(400).json({
          mgs: `No account data to generate receiver!`,
          success: false
        });
      }
      
      const tempData = lodash.cloneDeep(req.body);
      delete tempData.user;

      const exist = await this.model.findOne({userId: user.userId, numberAccount: tempData.numberAccount}).exec();
      if (exist) {
        return res.status(400).json({
          mgs: `Receiver is exist by numberAccount ${tempData.numberAccount}!`,
          success: false
        });
      }

      const bankType = await this.getTypeBank(tempData.bankId);
      if (!bankType) {
        return res.status(400).json({
          mgs: `No bank type data to generate receiver!`,
          success: false
        });
      }

      const customer = await this.getCustomer('paymentAccount', tempData.numberAccount);

      if (!customer) {
        return res.status(400).json({
          mgs: `No customer name data to generate receiver!`,
          success: false
        });
      }

      const id = await this.generateId();
      tempData.id = id;
      tempData.userId = user.userId
      tempData.remittanceType = bankType;
      tempData.name = customer.name;
      tempData.createTime = moment().unix();
      tempData.updateTime = moment().unix();
      tempData._status = true;

      const obj: any = await new this.model(tempData).save();
      obj.__v = undefined;
      obj._status = undefined;

      return res.status(201).json({
        mgs: `Create ${this.table} id ${obj.id} success!`,
        data: obj,
        success: true
      });
    } catch (err: any) {

      if (err && err.code === 11000) {
        return res.status(400).json({
          msg: `${this.table} ${Object.keys(err.keyValue)} ${Object.values(err.keyValue)} is exist!`,
          success: false,
          error: {
            mgs: `Trùng dữ liệu ${Object.keys(err.keyValue)}`,
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
      const idExist = await this.model.findOne({ id: req.params.id }).exec();

      if (idExist) {
        req.body.updateTime = moment().unix();
        req.body._status = true;

        if (!isNull(req.body.userId)) {
          const isExist = await this.modelUser.findOne({ id: req.body.userId }).exec();

          if (!isExist) {
            return res.status(400).json({
              mgs: `User ID does not exist!`,
              success: false
            });
          }
        }

        if (!isNull(req.body.idBank)) {
          const isExist = await this.modelBank.findOne({ id: req.body.idBank }).exec();

          if (!isExist) {
            return res.status(400).json({
              mgs: `Bank ID does not exist!`,
              success: false
            });
          }
        }

        await this.model.findOneAndUpdate({ id: req.params.id }, req.body, { _id: 0, __v: 0, _status: 0 });

        return res.status(200).json({
          data: req.body,
          success: true
        });
      }

      return res.status(400).json({
        mgs: `Not exist ${this.table} id ${req.params.id} to update!`,
        data: req.body,
        success: false,
        error: {
          status: 200,
          code: 5002
        }
      });
    } catch (err: any) {
      return res.status(400).json({
        mgs: `Update ${this.table} id ${req.params.id} error!`,
        data: req.body,
        success: false,
        error: {
          mgs: err.message,
          status: 400,
          code: 5000
        }
      });
    }
  };

  private async getTypeBank(bankId: string) {
    try {
      const bank = await this.modelBank.findOne({id: bankId});
      
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
      const option = {};
      Object.defineProperty(option, `${property}`, {
        value: value,
      });

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
