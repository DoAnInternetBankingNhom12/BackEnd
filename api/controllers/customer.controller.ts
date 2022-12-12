import { Request, Response } from 'express';

// Controllers
import BaseCtrl from './base';

// Models
import User from '../models/user';
import Customer from '../models/customer';
import Employee from '../models/employee';

// Services
import { sendObjInList } from '../services/ws.service';

// Interfaces
import { Notify } from '../interfaces/notify.interface';

// Utils
import * as moment from 'moment';
import * as lodash from 'lodash';
import { isNull } from '../utils/utils';

class CustomerCtrl extends BaseCtrl {
  model = Customer;
  modelUser = User;
  modelEmployee = Employee;
  table = 'Customer';

  // Get
  
  getCustomerByPayNumber = async (req: Request, res: Response) => {
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

  // Create
  createCustomer = async (req: Request, res: Response) => {
    try {
      const userIdExist = await this.modelUser.findOne({ id: req.body.userId }).exec();
      if (!userIdExist) {
        return res.status(400).json({
          msg: `User ID is not exist!`,
          success: false
        });
      }

      const idExist = await this.modelEmployee.findOne({ userId: req.body.userId }).exec();
      if (idExist) {
        return res.status(400).json({
          msg: `User ID is exist in employee!`,
          success: false
        });
      }

      const objUser = await this.setDataDefault(req.body);
      const objData = await new this.model(objUser).save();
      objData.__v = undefined;
      objData._id = undefined;

      return res.status(201).json({
        mgs: `Create ${this.table} id ${objData.id} success!`,
        data: objData,
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
        mgs: `Create customer id ${req.body.id} error!`,
        success: false,
        error: {
          mgs: err.message,
          status: 400,
          code: 5000
        }
      });
    }
  };

  createCustomerByUser = async (user: any) => {
    try {
      const id = await this.generateId();
      let objCustomer: any = {
        id,
        userId: user.id,
        name: user.name,
        accountBalance: 50000,
        paymentAccount: await this.getRDPaymentAccountNB(),
        createTime: moment().unix(),
        updateTime: moment().unix(),
        _status: true
      };

      const objData: any = await new this.model(objCustomer).save();
      objData.__v = undefined;
      objData._id = undefined;
      objData._status = undefined;
      objData.createTime = undefined;
      objData.updateTime = undefined;

      return {
        data: objData,
        success: true
      }
    } catch (err: any) {
      if (err && err.code === 11000) {
        return {
          mgs: `Trùng dữ liệu ${Object.keys(err.keyValue)}`,
          success: false,
          code: 11000
        };
      }

      return {
        mgs: `Create customer id ${user.id} error!`,
        success: false,
        error: err
      };
    }
  };

  // Update 
  updateCustomer = async (req: Request, res: Response) => {
    try {
      const idExist = await this.model.findOne({ id: req.params.id }).exec();

      if (!idExist) {
        return res.status(400).json({
          mgs: `Not exist ${this.table} id ${req.params.id} to update!`,
          data: req.body,
          success: false,
          error: {
            status: 200,
            code: 5002
          }
        });
      }

      if (!isNull(req.body.userId)) {
        const userIdExist = await this.modelUser.findOne({ id: req.body.userId }).exec();

        if (!userIdExist) {
          return res.status(400).json({
            msg: `ID user is not exist!`,
            success: false
          });
        }

        const idExist = await this.modelEmployee.findOne({ userId: req.body.userId }).exec();
        if (idExist) {
          return res.status(400).json({
            msg: `ID user is exist in employee!`,
            success: false
          });
        }
      }

      const objData: any = await this.model.findOneAndUpdate({ id: req.params.id }, req.body, { _id: 0, __v: 0, _status: 0 });
      const objSent: Notify = {
        type: 'update',
        table: this.table.toLocaleLowerCase(),
        msg: `Data customer ${objData.userId} has changed!`
      };

      sendObjInList(objSent, [objData.userId]);
      return res.status(200).json({
        data: req.body,
        success: true
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

  // Delete
  deleteCustomer = async (req: Request, res: Response) => {
    try {
      const idExist = await this.model.findOne({ id: req.params.id, _status: true }).exec();
      const customer = await this.model.findOne({ id: req.params.id, _status: true });

      if (idExist && customer && customer.userId) {
        await this.model.findOneAndUpdate({ id: req.params.id }, { _status: false });
        await this.modelUser.findOneAndUpdate({ id: customer.userId }, { _status: false });
        return res.status(200).json({
          mgs: `Delete ${this.table} id ${req.params.id} and user id success!`,
          success: true
        });
      }

      if (idExist) {
        await this.model.findOneAndUpdate({ id: req.params.id }, { _status: false });
        return res.status(200).json({
          mgs: `Delete ${this.table} id ${req.params.id} and can't delete user success!`,
          success: true
        });
      }

      return res.status(400).json({
        mgs: `Not exist ${this.table} id ${req.params.id} to delete!`,
        success: false,
        error: {
          status: 200,
          code: 5002
        }
      });
    } catch (err: any) {
      return res.status(400).json({
        mgs: `Delete ${this.table} id ${req.params.id} error!`,
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

  // Recharge
  recharge = async (req: Request, res: Response) => {
    try {
      const { paymentAccount, amountMoney, userId } = req.body;
      const employee = await this.modelEmployee.findOne({ userId: userId, _status: true });

      if (employee && employee.accountType === 'employee') {
        const customer = await this.model.findOne({ paymentAccount: paymentAccount});
        if (isNull(customer)) {
          return res.status(400).json({
            mgs: `Not exist ${this.table} id ${req.params.id}!`,
            success: false
          });
        }

        const newAccountBalance = customer?.accountBalance + amountMoney;

        const objData: any = await this.model.findOneAndUpdate({ paymentAccount }, { accountBalance: newAccountBalance }, { _status: true });
        const objSent: Notify = {
          type: 'update',
          table: this.table.toLocaleLowerCase(),
          msg: `Data customer ${objData.userId} has recharge ${newAccountBalance}!`
        };
  
        sendObjInList(objSent, [objData.userId]);
        return res.status(200).json({
          mgs: `Recharge ${this.table} payment account ${paymentAccount} success!`,
          success: true
        });
      }

      return res.status(400).json({
        mgs: `Not exist employee user id ${userId} to recharge!`,
        success: false
      });
    } catch (err: any) {
      return res.status(400).json({
        mgs: `Recharge ${this.table} payment account ${req.body.paymentAccount} error!`,
        data: req.body,
        success: false,
        error: err
      });
    }
  };

  private setDataDefault = async (obj: any) => {
    const id = await this.generateId();
    obj.id = id;
    obj.createTime = moment().unix();
    obj.updateTime = moment().unix();
    obj._status = true;

    const objData = obj;
    objData.accountBalance = 50000;
    objData.paymentAccount = await this.getRDPaymentAccountNB();
    return objData;
  }

  private async getRDPaymentAccountNB() {
    const min = 0;
    const max = 999999999999;
    let number = Math.abs(Math.floor(Math.random() * (min - max)) + min);
    let showNumber: string = number.toString().padStart(12, '0');
    let idExist = await this.model.findOne({ paymentAccount: showNumber }).exec();

    do {
      number = Math.abs(Math.floor(Math.random() * (min - max)) + min);
      showNumber = number.toString().padStart(12, '0');
      idExist = await this.model.findOne({ paymentAccount: showNumber }).exec();
    } while (idExist)

    showNumber = number.toString().padStart(12, '0').toString();
    return showNumber;
  }
}

export default CustomerCtrl;
