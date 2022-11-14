import { Request, Response } from 'express';

// Controllers
import BaseCtrl from './base';

// Models
import Customer from '../models/customer';

// Utils
import * as moment from 'moment';

class CustomerCtrl extends BaseCtrl {
  model = Customer;
  table = 'Customer';

  // Create
  createCustomerByUser = async (user: any, res: Response) => {
    try {
      const id = await this.getId();
      let objCustomer: any = {
        id,
        idUser: user.id,
        name: user.name,
        accountBalance: 50000,
        paymentAccount: await this.getRDPaymentAccountNB(),
        createTime: moment().unix(),
        updateTime: moment().unix(),
        _status: true
      };

      const obj = await new this.model(objCustomer).save();
      obj.__v = undefined;
      obj._id = undefined;
      user.customer = obj;

      return res.status(201).json({
        mgs: `Create customer id ${obj.id} success!`,
        data: user,
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
        mgs: `Create customer id ${user.id} error!`,
        success: false,
        error: {
          mgs: err.message,
          status: 400,
          code: 5000
        }
      });
    }
  };

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
