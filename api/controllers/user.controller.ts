import { Request, Response } from 'express';

// Models
import User from '../models/user';
import Custommer from '../models/customer';
import Employee from '../models/employee';

// Controllers
import BaseCtrl from './base';
import CustomerCtrl from './customer.controller';
import EmployeeCtrl from './employee.controller';

// Utils
import { decodeBase64, isNull } from '../utils/utils';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';
import * as lodash from 'lodash';
import * as moment from 'moment';


class UserCtrl extends BaseCtrl {
  model = User;
  modelEmployee = Employee;
  modelCustommer = Custommer;
  table = 'User';

  // Get
  getAllUser = async (req: Request, res: Response) => {
    try {
      const { inActive, isAll } = lodash.cloneDeep(req.body);

      let status = true;

      if (!isNull(inActive) && inActive === true) {
        status = false;
      }

      let docs = undefined;

      if (isAll) {
        docs = await this.model.aggregate([
          {
            $unset: ["_id", "password", "_status", "__v"]
          },
          {
            $lookup: {
              from: 'customer',
              localField: 'id',
              foreignField: 'userId',
              as: 'customer',
              pipeline: [
                { $project: { _id: 0, _status: 0, __v: 0 } }
              ],
            },
          },
          {
            $set: {
              customer: { $arrayElemAt: ["$customer", 0] }
            }
          },
          {
            $lookup: {
              from: 'employee',
              localField: 'id',
              foreignField: 'userId',
              as: 'employee',
              pipeline: [
                { $project: { _id: 0, _status: 0, __v: 0 } }
              ],
            }
          },
          {
            $set: {
              employee: { $arrayElemAt: ["$employee", 0] }
            }
          },
        ]);

        return res.status(200).json({
          data: docs,
          success: true
        });
      }

      docs = await this.model.aggregate([
        { $match: { _status: status } },
        {
          $unset: ["_id", "password", "_status", "__v"]
        },
        {
          $lookup: {
            from: 'customer',
            localField: 'id',
            foreignField: 'userId',
            as: 'customer',
            pipeline: [
              { $project: { _id: 0, _status: 0, __v: 0 } }
            ],
          },
        },
        {
          $set: {
            customer: { $arrayElemAt: ["$customer", 0] }
          }
        },
        {
          $lookup: {
            from: 'employee',
            localField: 'id',
            foreignField: 'userId',
            as: 'employee',
            pipeline: [
              { $project: { _id: 0, _status: 0, __v: 0 } }
            ],
          }
        },
        {
          $set: {
            employee: { $arrayElemAt: ["$employee", 0] }
          }
        },
      ]);

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
  }

  getUser = async (req: Request, res: Response) => {
    try {
      const searchId = lodash.cloneDeep(req.params.id);

      if (isNull(searchId)) {
      }
      const docs = await this.model.aggregate([
        { $match: { id: searchId } },
        {
          $unset: ["_id", "password", "_status", "__v"]
        },
        {
          $lookup: {
            from: 'customer',
            localField: 'id',
            foreignField: 'userId',
            as: 'customer',
            pipeline: [
              { $project: { _id: 0, _status: 0, __v: 0 } }
            ],
          },
        },
        {
          $set: {
            customer: { $arrayElemAt: ["$customer", 0] }
          }
        },
        {
          $lookup: {
            from: 'employee',
            localField: 'id',
            foreignField: 'userId',
            as: 'employee',
            pipeline: [
              { $project: { _id: 0, _status: 0, __v: 0 } }
            ],
          }
        },
        {
          $set: {
            employee: { $arrayElemAt: ["$employee", 0] }
          }
        },
      ]);

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
  }

  // Create
  createUser = async (req: Request, res: Response) => {
    try {
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
        mgs: `Create user id ${req.body.id} error!`,
        success: false,
        error: {
          mgs: err.message,
          status: 400,
          code: 5000
        }
      });
    }
  };

  createUserCustommer = async (req: Request, res: Response) => {
    try {
      const objUser = await this.setDataDefault(req.body);
      const objData: any = await new this.model(objUser).save();
      objData.__v = undefined;
      objData._id = undefined;
      objData.name = req.body.name;
      const customer = new CustomerCtrl();

      const customerObj = await customer.createCustomerByUser(objData);

      if (customerObj && customerObj.success) {
        objData.customer = customerObj.data;
        return res.status(201).json({
          mgs: `Create ${this.table} id ${objData.id} success!`,
          data: objData,
          success: true
        });
      }

      return res.status(201).json({
        mgs: `Create ${this.table} id ${objData.id} success but error create customer data!`,
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
        mgs: `Create user id ${req.body.id} error!`,
        success: false,
        error: {
          mgs: err.message,
          status: 400,
          code: 5000
        }
      });
    }
  };

  createUserEmployee = async (req: Request, res: Response) => {
    try {
      const objUser = await this.setDataDefault(req.body);
      const objData: any = await new this.model(objUser).save();
      objData.__v = undefined;
      objData._id = undefined;
      objData.name = req.body.name;
      objData.phoneNumbers = req.body.phoneNumbers;
      const employee = new EmployeeCtrl();

      const employeeObj = await employee.createEmployeeByUser(objData, 'employee');

      if (employeeObj && employeeObj.success) {
        objData.customer = employeeObj.data;
        return res.status(201).json({
          mgs: `Create ${this.table} id ${objData.id} success!`,
          data: objData,
          success: true
        });
      }

      return res.status(201).json({
        mgs: `Create ${this.table} id ${objData.id} success but error create employee data!`,
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
        mgs: `Create user id ${req.body.id} error!`,
        success: false,
        error: err
      });
    }
  };

  createUserAdmin = async (req: Request, res: Response) => {
    try {
      const objUser = await this.setDataDefault(req.body);
      const objData: any = await new this.model(objUser).save();
      objData.__v = undefined;
      objData._id = undefined;
      objData.name = req.body.name;
      objData.phoneNumbers = req.body.phoneNumbers;
      const employee = new EmployeeCtrl();

      const adminObj = await employee.createEmployeeByUser(objData, 'admin');

      if (adminObj && adminObj.success) {
        objData.customer = adminObj.data;
        return res.status(201).json({
          mgs: `Create ${this.table} id ${objData.id} success!`,
          data: objData,
          success: true
        });
      }

      return res.status(201).json({
        mgs: `Create ${this.table} id ${objData.id} success but error create admin data!`,
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
        mgs: `Create user id ${req.body.id} error!`,
        success: false,
        error: err
      });
    }
  };

  // Delete
  deleteUser = async (req: Request, res: Response) => {
    try {
      const isExistUser = await this.model.findOne({ id: req.params.id }).exec();

      if (!isNull(isExistUser)) {
        req.body.updateTime = moment().unix();
        await this.model.findOneAndUpdate({ id: req.params.id }, { updateTime: req.body.updateTime, _status: false });
        await this.modelEmployee.findOneAndUpdate({ userId: req.params.id }, { updateTime: req.body.updateTime, _status: false });
        await this.modelCustommer.findOneAndUpdate({ userId: req.params.id }, { updateTime: req.body.updateTime, _status: false });

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
        mgs: `Update ${this.table} id ${req.params.id} error!`,
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
    obj.customer = undefined;
    obj.employee = undefined;

    const objUser = obj;
    const encryptedPassword = await bcrypt.hash(obj.password, 10);
    const refreshToken = await bcrypt.hash(`${obj.userName}${obj.id}${moment().unix().toString()}`, 1)
    objUser.password = encryptedPassword;
    objUser.refreshToken = refreshToken;
    return objUser;
  }

  login = async (req: Request, res: Response) => {
    try {
      const { userName, password, refreshToken } = decodeBase64(req.headers.info);
      let user: any = undefined;

      if (!isNull(userName) && !isNull(password)) {
        user = lodash.cloneDeep(await this.model.findOne({ userName }, { _status: 0, __v: 0, _id: 0 }));

        if (user && (await bcrypt.compare(password, user.password))) {
          const token = generalToken(user.id, userName, user.email);

          user.token = token;
          user.password = undefined;

          return res.status(200).json({
            mgs: 'Login success!',
            data: user,
            success: true
          });
        }
      }

      if (!isNull(refreshToken)) {
        user = lodash.cloneDeep(await this.model.findOne({ refreshToken }, { _status: 0, __v: 0, _id: 0 }));

        if (user) {
          const token = generalToken(user.id, userName, user.email);

          user.token = token;
          user.password = undefined;

          return res.status(200).json({
            mgs: 'Login success!',
            data: user,
            success: true
          });
        }
      }

      if (!user) {
        return res.status(400).send({
          mgs: 'Data invalid!',
          data: {
            userName,
            password
          },
          success: false
        });
      }

      return res.status(400).send({
        mgs: 'Invalid credentials!',
        data: user,
        success: false,
        error: {
          status: 409,
          code: 4002
        }
      });
    } catch (err: any) {
      return res.status(400).send({
        mgs: 'Login error!',
        success: false,
        error: {
          error: err,
          mgs: err.message,
          status: 409,
          code: 5000
        }
      });
    };
  }

  loginRT = async (req: Request, res: Response) => {
    try {
      const { refreshToken } = decodeBase64(req.headers.info);
      let user: any = undefined;

      if (refreshToken) {
        user = lodash.cloneDeep(await this.model.findOne({ refreshToken }, { _status: 0, __v: 0, _id: 0, password: 0 }));

        if (user) {
          const token = generalToken(user.id, user.userName, user.email);

          user.token = token;
          user.password = undefined;

          return res.status(200).json({
            mgs: 'Login success!',
            data: user,
            success: true
          });
        }
      }

      if (!user) {
        return res.status(400).send({
          mgs: 'Data invalid!',
          success: false
        });
      }

      return res.status(400).send({
        mgs: 'Invalid credentials!',
        data: user,
        success: false,
        error: {
          status: 409,
          code: 4002
        }
      });
    } catch (err: any) {
      return res.status(400).send({
        mgs: 'Login error!',
        success: false,
        error: {
          error: err,
          mgs: err.message,
          status: 409,
          code: 5000
        }
      });
    };
  }

  logout = async (req: Request, res: Response) => {
    try {
      const { userName, password, refreshToken } = decodeBase64(req.headers.info);
      let user: any = undefined;

      if (userName && password) {
        user = lodash.cloneDeep(await this.model.findOne({ userName }, { _status: 0, __v: 0, _id: 0 }));

        if (user && (await bcrypt.compare(password, user.password))) {
          const refreshToken = await bcrypt.hash(`${req.body.userName}${req.body.id}${moment().unix().toString()}`, 1);
          await this.model.findOneAndUpdate({ id: user.id }, { refreshToken }, { _id: 0, __v: 0, _status: 0 });

          return res.status(200).json({
            mgs: 'Logout success!',
            success: true
          });
        }
      }

      if (refreshToken) {
        user = lodash.cloneDeep(await this.model.findOne({ refreshToken }, { _status: 0, __v: 0, _id: 0 }));

        if (user) {
          const refreshToken = await bcrypt.hash(`${req.body.userName}${req.body.id}${moment().unix().toString()}`, 1);
          await this.model.findOneAndUpdate({ id: user.id }, { refreshToken }, { _id: 0, __v: 0, _status: 0 });

          return res.status(200).json({
            mgs: 'Logout success!',
            success: true
          });
        }
      }

      if (!user) {
        return res.status(400).send({
          mgs: 'Data invalid!',
          data: {
            userName,
            password
          },
          success: false
        });
      }

      return res.status(400).send({
        mgs: 'Invalid credentials!',
        data: user,
        success: false,
        error: {
          status: 409,
          code: 4002
        }
      });
    } catch (err: any) {
      return res.status(400).send({
        mgs: 'Logout error!',
        success: false,
        error: {
          error: err,
          mgs: err.message,
          status: 409,
          code: 5000
        }
      });
    };
  }

  changePassword = async (req: Request, res: Response) => {
    try {
      const { userName, password, newPassword } = decodeBase64(req.headers.info);
      let user: any = undefined;

      if (!isNull(userName) && !isNull(password) && !isNull(newPassword)) {
        user = await this.model.findOne({ userName }, { _status: 0, __v: 0, _id: 0 });
        if (user && (await bcrypt.compare(password, user.password))) {
          const encryptedPassword = await bcrypt.hash(newPassword, 10);
          const result: any = await this.model.findOneAndUpdate({ id: user.id }, { password: encryptedPassword }, { _id: 0, __v: 0, _status: 0 });

          if (result) {
            result.password = undefined;
            return res.status(200).json({
              mgs: 'Change password success!',
              data: result,
              success: true
            });
          }

          return res.status(400).send({
            mgs: 'Change password error!',
            success: false,
          });
        }
      }

      return res.status(400).send({
        mgs: 'Data invalid error!',
        success: false,
      });
    }
    catch (err: any) {
      return res.status(400).send({
        mgs: 'Change password error!',
        success: false,
        error: {
          error: err,
          mgs: err.message,
        }
      });
    }
  }
}

function generalToken(id: string, userName: string, email: string) {
  return jwt.sign(
    { userId: id, userName, email },
    process.env.TOKEN_JWT_KEY as string,
    {
      expiresIn: '5m',
    }
  );
};



export default UserCtrl;
