import { Request, Response } from 'express';

// Models
import User from '../models/user';

// Controllers
import BaseCtrl from './base';
// import CustomerCtrl from '../controllers/customer.controller';

// Utils
import * as moment from 'moment';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { decodeBase64 } from '../utils/utils';


class UserCtrl extends BaseCtrl {
  model = User;
  table = 'User';

  // Create
  createUser = async (req: Request, res: Response) => {
    try {
      const id = await this.getId();
      req.body.id = id;
      req.body.createTime = moment().unix();
      req.body.updateTime = moment().unix();
      req.body._status = true;

      const objUser = req.body;
      const encryptedPassword = await bcrypt.hash(req.body.password, 10);
      const refreshToken = await bcrypt.hash(`${req.body.userName}${req.body.id}${moment().unix().toString()}`, 1)

      objUser.password = encryptedPassword;
      objUser.refreshToken = refreshToken;

      const obj = await new this.model(objUser).save();

      obj.__v = undefined;
      obj._id = undefined;

      return res.status(201).json({
        mgs: `Create ${this.table} id ${obj.id} success!`,
        data: obj,
        success: true
      });
    } catch (err: any) {

      if (err && err.code === 11000) {
        return res.status(200).json({
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

  // createUserCustommer = async (req: Request, res: Response) => {
  //   try {
  //     const id = await this.getId();
  //     req.body.id = id;
  //     req.body.createTime = moment().unix();
  //     req.body.updateTime = moment().unix();
  //     req.body._status = true;
  //     const objUser = req.body;
  //     const encryptedPassword = await bcrypt.hash(req.body.password, 10);
  //     const refreshToken = await bcrypt.hash(`${req.body.userName}${req.body.id}${moment().unix().toString()}`, 1)
  //     objUser.password = encryptedPassword;
  //     objUser.refreshToken = refreshToken;
  //     const obj = await new this.model(objUser).save();
  //     const customer = new CustomerCtrl();
  //     console.log('obj User', obj);
  //     obj.__v = undefined;
  //     obj._id = undefined;
  //     return customer.createCustomer(obj.id, res)
  //   } catch (err: any) {

  //     if (err && err.code === 11000) {
  //       return res.status(200).json({
  //         msg: `${this.table} ${Object.keys(err.keyValue)} ${Object.values(err.keyValue)} is exist!`,
  //         success: false,
  //         error: {
  //           mgs: `Trùng dữ liệu ${Object.keys(err.keyValue)}`,
  //           code: 11000
  //         }
  //       });
  //     }

  //     return res.status(400).json({
  //       mgs: `Create user id ${req.body.id} error!`,
  //       success: false,
  //       error: {
  //         mgs: err.message,
  //         status: 400,
  //         code: 5000
  //       }
  //     });
  //   }
  // };

  login = async (req: Request, res: Response) => {
    try {
      const { userName, password } = decodeBase64(req.headers.info);
      console.log(decodeBase64(req.headers.info));
      if (!(userName && password)) {
        return res.status(200).send({
          mgs: 'Data invalid!',
          data: {
            userName,
            password
          },
          success: false
        });
      }

      const user: any = await this.model.findOne({ userName }, { _status: 0, __v: 0, _id: 0 });

      if (user && (await bcrypt.compare(password, user.password))) {
        const token = jwt.sign(
          { user_id: user.id, userName },
          process.env.TOKEN_JWT_KEY as string,
          {
            expiresIn: '2m',
          }
        );

        user.token = token;
        user.password = undefined;
        console.log('user', user);
        return res.status(200).json({
          mgs: 'Sign in success!',
          data: user,
          success: true
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
        mgs: 'Sign in error!',
        success: false,
        error: {
          error: err.message,
          status: 409,
          code: 5000
        }
      });
    }
  }
}

export default UserCtrl;
