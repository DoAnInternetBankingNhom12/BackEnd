import { Request, Response } from 'express';

// Utils
import * as moment from 'moment';
import * as lodash from 'lodash';
import { isNull } from '../utils/utils';

abstract class BaseCtrl {

  abstract model: any;
  abstract table: string;

  // Get all
  getAll = async (req: Request, res: Response) => {
    try {
      const { inActive, isAll } = lodash.cloneDeep(req.body);

      let _status = true;

      if (!isNull(inActive) && inActive === true) {
        _status = false;
      }

      let docs = undefined;

      if (isAll) {
        docs = await this.model.find({}, { _id: 0, __v: 0, _status: 0 });
        return res.status(200).json({
          data: docs,
          success: true
        });
      }

      docs = await this.model.find({ _status }, { _id: 0, __v: 0, _status: 0 });
      return res.status(200).json({
        data: docs,
        success: true
      });
    } catch (err: any) {
      return res.status(400).json({
        mgs: `Get all ${this.table} error!`,
        success: false,
        error: {
          mgs: err.message,
          status: 400,
          code: 5000
        }
      });
    }
  };

    // Get by id
    get = async (req: Request, res: Response) => {
      try {
        const obj = await this.model.findOne({ id: req.params.id }, { _id: 0, __v: 0, _status: 0 });
        if (isNull(obj)) {
          return res.status(400).json({
            mgs: `Get ${this.table} id ${req.body.id} not exist!`,
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

  // Count all
  count = async (req: Request, res: Response) => {
    try {
      const count = await this.model.count({ _status: true });

      return res.status(200).json({
        data: count,
        success: true
      });
    } catch (err: any) {
      return res.status(400).json({
        mgs: `Count ${this.table} error!`,
        success: false,
        error: {
          mgs: err.message,
          status: 400,
          code: 5000
        }
      });
    }
  };

  // Insert
  insert = async (req: Request, res: Response) => {
    try {
      const id = await this.generateId();
      req.body.id = id;
      req.body.createTime = moment().unix();
      req.body.updateTime = moment().unix();
      req.body._status = true;

      const obj = await new this.model(req.body).save();
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

  // Update by id
  update = async (req: Request, res: Response) => {
    try {
      const idExist = await this.model.findOne({ id: req.params.id }).exec();

      if (idExist) {
        req.body.updateTime = moment().unix();
        req.body._status = true;

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

  // Delete by id
  delete = async (req: Request, res: Response) => {
    try {
      const idExist = await this.model.findOne({ id: req.params.id, _status: true }).exec();

      if (idExist) {
        await this.model.findOneAndUpdate({ id: req.params.id }, { _status: false });
        return res.status(200).json({
          mgs: `Delete ${this.table} id ${req.params.id} success!`,
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

  async generateId() {
    let count = await this.model.count();
    let id = `${this.table.toLocaleLowerCase()}${count}`;
    let idExist = await this.model.findOne({ id }).exec();

    do {
      id = `${this.table.toLocaleLowerCase()}${count}`;
      idExist = await this.model.findOne({ id }).exec();
      count++;
    } while (idExist)

    return id;
  }
}

export default BaseCtrl;
