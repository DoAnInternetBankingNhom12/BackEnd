import { Request, Response } from 'express';

// Models
import Receiver from '../models/receiver';
import User from '../models/user';
import Bank from '../models/bank';

// Controllers
import BaseCtrl from './base';

// Utils
import * as moment from 'moment';
import * as lodash from 'lodash';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { decodeBase64, isNull } from '../utils/utils';


class ReceiverCtrl extends BaseCtrl {
  model = Receiver;
  modelUser = User;
  modelBank = Bank;
  table = 'Receiver';

  // Insert
  createReceiver = async (req: Request, res: Response) => {
    try {
      const id = await this.generateId();
      req.body.id = id;
      req.body.createTime = moment().unix();
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

      const obj: any = await new this.model(req.body).save();
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
        error: {
          mgs: err.message,
          status: 400,
          code: 5000
        }
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
}

export default ReceiverCtrl;
