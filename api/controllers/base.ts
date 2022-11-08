import { Request, Response } from 'express';
import * as moment from 'moment';

abstract class BaseCtrl {

  abstract model: any;

  // Get all
  getAll = async (req: Request, res: Response) => {
    try {
      const docs = await this.model.find({ _status: true });

      return res.status(200).json({
        data: docs,
        success: true
      });
    } catch (err: any) {
      return res.status(400).json({
        mgs: `Get all data error!`,
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
        mgs: `Count data error!`,
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
      const idExist = await this.model.findOne({ id: req.body.id });

      if (!idExist) {
        req.body.createTime = moment().unix();
        req.body.updateTime = moment().unix();
        req.body._status = true;

        const obj = await new this.model(req.body).save();

        return res.status(201).json({
          mgs: `Create data id ${obj.id} success!`,
          data: obj,
          success: true
        });
      }

      return res.status(200).json({
        msg: `Data id ${req.body.id} is exist!`,
        data: req.body,
        success: false,
        error: {
          status: 200,
          code: 5001
        }
      });
    } catch (err: any) {
      return res.status(400).json({
        mgs: `Create data id ${req.body.id} error!`,
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

  // Get by id
  get = async (req: Request, res: Response) => {
    try {
      const obj = await this.model.findOne({ id: req.params.id });

      return res.status(200).json({
        data: obj,
        success: true
      });
    } catch (err: any) {
      return res.status(400).json({
        mgs: `Get data id ${req.body.id} error!`,
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

  // Update by id
  update = async (req: Request, res: Response) => {
    try {
      const idExist = await this.model.findOne({ id: req.params.id }).exec();

      if (idExist) {
        req.body.updateTime = moment().unix();
        req.body._status = true;

        await this.model.findOneAndUpdate({ id: req.params.id }, req.body);

        return res.status(200).json({
          data: req.body,
          success: true
        });
      }

      return res.status(200).json({
        mgs: `Not exist data id ${req.params.id} to update!`,
        data: req.body,
        success: false,
        error: {
          status: 200,
          code: 5002
        }
      });
    } catch (err: any) {
      return res.status(400).json({
        mgs: `Update data id ${req.params.id} error!`,
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
          mgs: `Delete data id ${req.params.id} success!`,
          success: true
        });
      }

      return res.status(200).json({
        mgs: `Not exist data id ${req.params.id} to delete!`,
        success: false,
        error: {
          status: 200,
          code: 5002
        }
      });
    } catch (err: any) {
      return res.status(400).json({
        mgs: `Delete data id ${req.params.id} error!`,
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

export default BaseCtrl;
