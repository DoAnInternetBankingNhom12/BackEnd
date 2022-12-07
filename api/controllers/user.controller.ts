import { Request, Response } from 'express';

// Models
import User from '../models/user';
import Custommer from '../models/customer';
import Employee from '../models/employee';

// Controllers
import BaseCtrl from './base';
import CustomerCtrl from './customer.controller';
import EmployeeCtrl from './employee.controller';

// Services
import { sendPassMail } from '../services/mail.service';

// Utils
import * as moment from 'moment';
import * as lodash from 'lodash';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { decodeBase64, isNull, getPipeLineGet } from '../utils/utils';


class UserCtrl extends BaseCtrl {
  model = User;
  modelEmployee = Employee;
  modelCustommer = Custommer;
  table = 'User';

  lookups = [
    {
      from: 'customer',
      localField: 'id',
      foreignField: 'userId',
      as: 'customer',
      pipeline: [
        { $project: { _id: 0, _status: 0, __v: 0 } }
      ],
    },
    {
      from: 'employee',
      localField: 'id',
      foreignField: 'userId',
      as: 'employee',
      pipeline: [
        { $project: { _id: 0, _status: 0, __v: 0 } }
      ],
    }
  ];

  sets = [
    {
      customer: { $arrayElemAt: ['$customer', 0] }
    },
    {
      employee: { $arrayElemAt: ['$employee', 0] },
    },
    {
      role: {
        $switch: {
          branches: [
            { case: { $eq: ['$employee.accountType', 'admin'] }, then: 'admin' },
            { case: { $eq: ['$employee.accountType', 'employee'] }, then: 'employee' },
            { case: { $ne: ['$customer', undefined] }, then: 'customer' }
          ],
          default: ''
        }
      }
    }
  ];

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
        docs = await this.model.aggregate(getPipeLineGet(['password'], undefined, this.lookups, this.sets));

        return res.status(200).json({
          data: docs,
          success: true
        });
      }

      docs = await this.model.aggregate(getPipeLineGet(['password'], { _status: status }, this.lookups, this.sets));

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
        return res.status(400).json({
          mgs: `No user id to get!`,
          success: false
        });
      }

      const docs = await this.model.aggregate(getPipeLineGet(['password'], { id: searchId }, this.lookups, this.sets));

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

  getUserByPayNumber = async (req: Request, res: Response) => {
    try {
      const paymentAccount = lodash.cloneDeep(req.params.paymentAccount);

      if (isNull(paymentAccount)) {
        return res.status(400).json({
          mgs: `No user id to get!`,
          success: false
        });
      }

      const lookups = [
        {
          from: 'customer',
          localField: 'id',
          foreignField: 'userId',
          as: 'customer',
          pipeline: [
            { $project: { _id: 0, _status: 0, __v: 0, accountBalance: 0 } },
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$paymentAccount', paymentAccount] },
                  ]
                }
              }
            }
          ],
        }
      ];

      const sets = [
        {
          customer: { $arrayElemAt: ['$customer', 0] }
        },
        {
          role: {
            $switch: {
              branches: [
                { case: { $ne: ['$customer', undefined] }, then: 'customer' }
              ],
              default: ''
            }
          }
        }
      ];

      const docs = await this.model.aggregate(getPipeLineGet(['password'], { customer: { $exists: true } }, lookups, sets));
      
      if (isNull(docs)) {
        return res.status(400).json({
          mgs: 'Payment account not exist!',
          success: false
        });
      }

      return res.status(200).json({
        data: docs[0],
        success: true
      });
    } catch (err: any) {
      return res.status(400).json({
        mgs: `Get user ${this.table} error!`,
        success: false,
        error: {
          mgs: err.message,
          status: 400,
          code: 5000
        }
      });
    }
  }

  getUserInfo = async (req: Request, res: Response) => {
    try {
      const searchId = lodash.cloneDeep(req.body.user.userId);

      if (isNull(searchId)) {
        return res.status(400).json({
          mgs: `No user id to get!`,
          success: false
        });
      }

      const docs = await this.model.aggregate(getPipeLineGet(['password'], { id: searchId }, this.lookups, this.sets));

      return res.status(200).json({
        data: docs[0],
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
      req.body.password = '123abc456';
      const objUser = await this.setDataDefault(req.body);
      const objData = await new this.model(objUser).save();
      objData.__v = undefined;
      objData._id = undefined;

      const statusMail: any = await sendPassMail(objUser, req.body.password);

      if (statusMail && statusMail.success) {
        return res.status(201).json({
          mgs: `Create ${this.table} id ${objData.id} success!`,
          data: objData,
          success: true
        });
      }

      return res.status(201).json({
        mgs: `Create ${this.table} id ${objData.id} success but can't sent email!`,
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
      req.body.password = '123abc456';
      const objUser = await this.setDataDefault(req.body);
      const objData: any = await new this.model(objUser).save();
      objData.__v = undefined;
      objData._id = undefined;
      objData.name = req.body.name;
      const customer = new CustomerCtrl();

      const customerObj = await customer.createCustomerByUser(objData);
      const statusMail: any = await sendPassMail(objUser, req.body.password);

      if (statusMail && statusMail.success) {
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
      }

      return res.status(201).json({
        mgs: `Create ${this.table} id ${objData.id} success but can't sent email!`,
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
      req.body.password = '123abc456';
      const objUser = await this.setDataDefault(req.body);
      const objData: any = await new this.model(objUser).save();
      objData.__v = undefined;
      objData._id = undefined;
      objData.name = req.body.name;
      objData.phoneNumbers = req.body.phoneNumbers;
      const employee = new EmployeeCtrl();

      const employeeObj = await employee.createEmployeeByUser(objData, 'employee');
      const statusMail: any = await sendPassMail(objUser, req.body.password);

      if (statusMail && statusMail.success) {
        if (employeeObj && employeeObj.success) {
          objData.employee = employeeObj.data;
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
      }

      return res.status(201).json({
        mgs: `Create ${this.table} id ${objData.id} success but can't sent email!`,
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
      req.body.password = '123abc456';
      const objUser = await this.setDataDefault(req.body);
      const objData: any = await new this.model(objUser).save();
      objData.__v = undefined;
      objData._id = undefined;
      objData.name = req.body.name;
      objData.phoneNumbers = req.body.phoneNumbers;
      const employee = new EmployeeCtrl();

      const adminObj = await employee.createEmployeeByUser(objData, 'admin');
      const statusMail: any = await sendPassMail(objUser, req.body.password);

      if (statusMail && statusMail.success) {
        if (adminObj && adminObj.success) {
          objData.employee = adminObj.data;
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
      }

      return res.status(201).json({
        mgs: `Create ${this.table} id ${objData.id} success but can't sent email!`,
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
    const newObj = lodash.cloneDeep(obj);
    const id = await this.generateId();
    newObj.id = id;
    newObj.createTime = moment().unix();
    newObj.updateTime = moment().unix();
    newObj._status = true;
    newObj.customer = undefined;
    newObj.employee = undefined;

    const objUser = newObj;
    const encryptedPassword = await bcrypt.hash(newObj.password, 10);
    const refreshToken = await bcrypt.hash(`${newObj.userName}${newObj.id}${moment().unix().toString()}`, 1)
    objUser.password = encryptedPassword;
    objUser.refreshToken = refreshToken;
    return objUser;
  }

  login = async (req: Request, res: Response) => {
    try {
      const { userName, password, refreshToken } = decodeBase64(req.headers.info);
      let user: any = undefined;

      if (!isNull(userName) && !isNull(password)) {
        user = lodash.cloneDeep(await this.model.aggregate(getPipeLineGet([], { userName: userName }, this.lookups, this.sets)))[0];

        if (user) {
          if ((await bcrypt.compare(password, user.password))) {
            const token = generalToken(user.id, userName, user.email, user.role);

            user.token = token;
            user.password = undefined;

            return res.status(200).json({
              mgs: 'Login success!',
              data: user,
              success: true
            });
          } else {
            return res.status(400).json({
              mgs: 'Wrong password!',
              success: false
            });
          }
        } else {
          return res.status(400).send({
            mgs: 'Account does not exist! Maybe wrong username!',
            success: false
          });
        }
      }


      if (!isNull(refreshToken)) {
        user = lodash.cloneDeep(await this.model.aggregate(getPipeLineGet([], { refreshToken: refreshToken }, this.lookups, this.sets)))[0];


        if (user) {
          const token = generalToken(user.id, userName, user.email, user.role);

          user.token = token;
          user.password = undefined;

          return res.status(200).json({
            mgs: 'Login success!',
            data: user,
            success: true
          });
        } else {
          return res.status(400).json({
            mgs: 'Refresh token invalid!',
            success: false
          });
        }
      }

      if (!user) {
        return res.status(400).send({
          mgs: 'Data invalid!',
          success: false
        });
      }

      return res.status(409).send({
        mgs: 'Invalid credentials!',
        success: false
      });
    } catch (err: any) {
      return res.status(409).send({
        mgs: 'Login error!',
        success: false,
        error: err
      });
    };
  }

  loginRT = async (req: Request, res: Response) => {
    try {
      const { refreshToken } = decodeBase64(req.headers.info);
      let user: any = undefined;

      if (!isNull(refreshToken)) {
        user = lodash.cloneDeep(await this.model.aggregate(getPipeLineGet([], { refreshToken: refreshToken }, this.lookups, this.sets)))[0];

        if (user) {
          const token = generalToken(user.id, user.userName, user.email, user.role);

          user.token = token;
          user.password = undefined;

          return res.status(200).json({
            mgs: 'Login success!',
            data: {
              token
            },
            success: true
          });
        } else {
          return res.status(400).json({
            mgs: 'Refresh token invalid!',
            success: false
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
        success: false
      });
    } catch (err: any) {
      return res.status(400).send({
        mgs: 'Login error!',
        success: false,
        error: err
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

  forgotPassword = async (req: Request, res: Response) => {
    try {
      const { userName, newPassword } = decodeBase64(req.headers.info);
      let user: any = undefined;

      if (!isNull(userName) && !isNull(newPassword)) {
        user = await this.model.findOne({ userName }, { _status: 0, __v: 0, _id: 0, password: 0 });
        if (user) {
          const encryptedPassword = await bcrypt.hash(newPassword, 10);
          const result: any = await this.model.findOneAndUpdate({ id: user.id }, { password: encryptedPassword }, { _id: 0, __v: 0, _status: 0 });

          if (result) {
            result.password = undefined;
            return res.status(200).json({
              mgs: 'Forgot password success!',
              data: result,
              success: true
            });
          }

          return res.status(400).send({
            mgs: 'Forgot password error!',
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
        mgs: 'Forgot password error!',
        success: false,
        error: {
          error: err,
          mgs: err.message,
        }
      });
    }
  }
}

function generalToken(id: string, userName: string, email: string, role: string) {
  return jwt.sign(
    { userId: id, userName, email, role },
    process.env.TOKEN_JWT_KEY as string,
    {
      expiresIn: '5m',
    }
  );
};

export default UserCtrl;
