import { Request, Response } from 'express';

// Controllers
import BaseCtrl from './base';

// Models
import User from '../models/user';
import Employee from '../models/employee';
import Custommer from '../models/customer';

// Services
import { sendObjInList } from '../services/ws.service';

// Interfaces
import { Notify } from '../interfaces/notify.interface';

// Utils
import * as moment from 'moment';
import { isNull } from '../utils/utils';

class EmployeeCtrl extends BaseCtrl {
  model = Employee;
  modelUser = User;
  modelCustommer = Custommer;
  table = 'Employee';

  // Create
  createEmployee = async (req: Request, res: Response) => {
    try {
      const userIdExist = await this.modelUser.findOne({ id: req.body.userId }).exec();

      if (!userIdExist) {
        return res.status(400).json({
          msg: `User ID is not exist!`,
          success: false
        });
      }

      const idExist = await this.modelCustommer.findOne({ userId: req.body.userId }).exec();
      if (idExist) {
        return res.status(400).json({
          msg: `User ID is exist in customer!`,
          success: false
        });
      }

      const type = ['admin', 'employee'];
      if (!isNull(req.body.accountType) && !type.includes(req.body.accountType)) {
        return res.status(400).json({
          msg: `AccountType employee is not admin or employee!`,
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

  createEmployeeByUser = async (user: any, accountType: 'employee' | 'admin') => {
    try {
      const id = await this.generateId();
      const objEmployee: any = {
        id,
        userId: user.id,
        name: user.name,
        phoneNumbers: user.phoneNumbers,
        accountType,
        createTime: moment().unix(),
        updateTime: moment().unix(),
        _status: true
      };

      const objData: any = await new this.model(objEmployee).save();
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
        }
          ;
      }

      return {
        mgs: `Create customer id ${user.id} error!`,
        success: false,
        error: err,
      };
    }
  };

  // Update
  updateEmployee = async (req: Request, res: Response) => {
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

        const idExist = await this.modelCustommer.findOne({ userId: req.body.userId }).exec();
        if (idExist) {
          return res.status(400).json({
            msg: `ID user is exist in customer!`,
            success: false
          });
        }
      }

      const type = ['admin', 'employee'];
      if (!isNull(req.body.accountType) && !type.includes(req.body.accountType)) {
        return res.status(400).json({
          msg: `accountType employee is not admin or employee!`,
          success: false
        });
      }

      const objData: any = await this.model.findOneAndUpdate({ id: req.params.id }, req.body, { _id: 0, __v: 0, _status: 0 });
      const objSent: Notify = {
        type: 'update',
        table: this.table.toLocaleLowerCase(),
        msg: `Data employee ${objData.userId} has changed!`
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
  deleteEmployee = async (req: Request, res: Response) => {
    try {
      const idExist = await this.model.findOne({ id: req.params.id, _status: true }).exec();
      const employee = await this.model.findOne({ id: req.params.id, _status: true });

      if (idExist && employee && employee.userId) {
        await this.model.findOneAndUpdate({ id: req.params.id }, { _status: false });
        await this.modelUser.findOneAndUpdate({ id: employee.userId }, { _status: false });
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

  private setDataDefault = async (obj: any) => {
    const id = await this.generateId();
    obj.id = id;
    obj.createTime = moment().unix();
    obj.updateTime = moment().unix();
    obj._status = true;

    const objData = obj;
    return objData;
  }
}

export default EmployeeCtrl;
